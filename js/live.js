"use strict";
const SeismoLive=(()=>{
  const join=parts=>{
    const buf=new Uint8Array(parts.reduce((sum,v)=>sum+v.length,0));
    let offset=0;
    for(const v of parts){buf.set(v,offset);offset+=v.length;}
    return buf;
  };
  const utc=ms=>new Date(ms).toISOString();
  const wait=ms=>new Promise(done=>setTimeout(done,Math.max(0,ms)));
  const cooldown=new Map();

  function routeGroups(routes){
    const map=new Map();
    for(const row of routes){
      const [net,,loc,cha]=row.id.split(".");
      const key=row.protocol==="WSS"?row.url:JSON.stringify([row.url,net,loc,cha]);
      if(!map.has(key))map.set(key,[]);
      map.get(key).push(row);
    }
    return [...map.values()];
  }
  function queryURL(rows,r){
    const [network,,loc,channel]=rows[0].id.split(".");
    const args=new URLSearchParams({network,location:loc||"--",channel,
      station:rows.map(s=>s.id.split(".")[1]).join(","),
      starttime:r.start_utc,endtime:r.end_utc,nodata:"404"});
    return rows[0].url+"?"+args;
  }
  async function boundedBody(response,maxBytes=768000){
    const reader=response.body.getReader();
    const parts=[];
    let length=0;
    for(;;){
      const item=await reader.read();
      if(item.done)break;
      length+=item.value.length;
      if(length>maxBytes){await reader.cancel();throw Error("Υπέρβαση μεγέθους miniSEED");}
      parts.push(item.value);
    }
    return join(parts);
  }
  function unpackFrame(data){
    const b=new Uint8Array(data);
    if(b.length<17||b[0]!==83||b[1]!==69||b[2]!==50)return null;
    const len=b[16],size=new DataView(b.buffer).getUint32(4,true);
    return len>0&&b.length===17+len+size?b.subarray(17+len):null;
  }
  function stream(rows,until,remaining,receive,annotate){
    return new Promise(resolve=>{
      let socket;
      let deadline;
      let opening;
      let commandTimer;
      let closed=false;
      let pending;
      const commands=rows.flatMap(row=>{
        const [net,sta,loc,ch]=row.id.split(".");
        return ["STATION "+net+"_"+sta,"SELECT "+loc+"_"+[...ch].join("_")+".2D","DATA"];
      });
      function stop(state){
        if(closed)return;
        closed=true;
        clearTimeout(deadline);clearTimeout(opening);clearTimeout(commandTimer);
        if(socket&&socket.readyState<2)socket.close();
        if(state)annotate(rows,state);
        resolve();
      }
      const command=line=>{
        socket.send(line);
        clearTimeout(commandTimer);
        commandTimer=setTimeout(()=>stop("WSS: δεν απάντησε στην εντολή "+line.split(" ")[0]),Math.min(4000,remaining()));
      };
      try{
        annotate(rows,"Σύνδεση WSS");
        socket=new WebSocket(rows[0].url);
        socket.binaryType="arraybuffer";
        deadline=setTimeout(()=>stop(),until);
        opening=setTimeout(()=>stop("WSS: λήξη σύνδεσης"),Math.min(6000,until));
        socket.onopen=()=>{
          clearTimeout(opening);
          pending="HELLO";command(pending);
        };
        socket.onerror=()=>stop("WSS: αποτυχία σύνδεσης");
        socket.onclose=()=>stop("WSS: κλειστή σύνδεση");
        socket.onmessage=event=>{
          if(closed||remaining()<=0)return;
          if(typeof event.data!=="string"){
            const raw=unpackFrame(event.data);
            if(raw)receive(rows,raw,true);
            return;
          }
          const message=event.data.trim();
          if(pending==="HELLO"){
            if(!/SLPROTO:4\./i.test(message)){stop("WSS: χωρίς υποστήριξη SeedLink 4");return;}
            pending="SLPROTO";command("SLPROTO 4.0");return;
          }
          if(!/^OK(?:\s|$)/i.test(message)){stop("WSS: απορρίφθηκε η συνδρομή");return;}
          const next=commands.shift();
          if(next){pending=next;command(next);}
          else{clearTimeout(commandTimer);socket.send("END");annotate(rows,"Συνδρομή SeedLink 4");}
        };
      }catch(e){stop("WSS: "+e.message);}
    });
  }

  async function evaluate(r,routes,emit,anchor){
    const frozen=r.freeze_ms-r.accepted_ms;
    const remaining=()=>Math.max(0,frozen-(performance.now()-anchor));
    const marks=new Map(routes.map(st=>[st.key,{key:st.key,complete:false,values_in_window:0,
                                               status:{state:"Προγραμματισμένη εφεδρεία"}}]));
    const candidates=new Map(),rawByRoute=new Map(),packets=new Map();
    const update=()=>emit([...marks.values()]);
    const state=(rows,label,data={})=>{
      for(const st of rows){
        const row=marks.get(st.key);
        if(!row.complete)row.status={state:label,...data};
      }
      update();
    };
    function receive(rows,bytes,live){
      const receivedMs=r.accepted_ms+Math.floor(performance.now()-anchor);
      if(receivedMs>r.freeze_ms)return;
      let segments;
      try{segments=SeismoMseed.parse(bytes,false);}
      catch(error){state(rows,"miniSEED: "+error.message);return;}
      for(const st of rows){
        const relevant=segments.filter(x=>x.id===st.id);
        if(!relevant.length)continue;
        let chunks=relevant.map(x=>x.raw);
        if(live){
          chunks=relevant.filter(x=>x.start<BigInt(r.start_ms+r.duration*1000)*1000000n&&
                            x.start>BigInt(r.start_ms-120000)*1000000n).map(x=>x.raw);
          if(!chunks.length)continue;
          const stored=packets.get(st.key)||[];
          if(stored.length+chunks.length>256)continue;
          stored.push(...chunks);packets.set(st.key,stored);chunks=stored;
        }
        const raw=join(chunks);
        const row=marks.get(st.key);
        try{
          const decoded=SeismoMseed.windowSamples(raw,st,r.start_ms,r.duration);
          row.values_in_window=decoded.count;
          row.complete=decoded.count===st.hz*r.duration;
          row.arrival_ms=receivedMs;
          row.window_delay_ms=receivedMs-(r.start_ms+r.duration*1000);
          delete row.sample_age_ms;
          if(decoded.lastSampleMs!==null)row.sample_age_ms=receivedMs-decoded.lastSampleMs;
          row.status={...row.status,state:row.complete?"Πλήρης λήψη":decoded.count?"Μερική κάλυψη":"Εκτός παραθύρου"};
          candidates.delete(st.key);
          rawByRoute.delete(st.key);
          delete row.wave;
          if(decoded.count){
            rawByRoute.set(st.key,raw);
            // The waveform stays in session memory and is excluded from exported proofs.
            Object.defineProperty(row,"wave",{configurable:true,
              value:Array.from(decoded.values,(v,i)=>decoded.mask[i]===1?v:null)});
            if(row.complete)candidates.set(st.key,decoded.values);
          }
        }catch(error){
          row.status={...row.status,state:"miniSEED: "+error.message};
          row.complete=false;row.values_in_window=0;
          candidates.delete(st.key);rawByRoute.delete(st.key);delete row.wave;
        }
      }
      update();
    }

    const groups=routeGroups(routes),byHost=new Map();
    const websocketGroups=groups.filter(g=>g[0].protocol==="WSS");
    const ws=websocketGroups.slice(0,1).map(g=>stream(g,remaining(),remaining,receive,state));
    websocketGroups.slice(1).forEach(g=>state(g,"Όριο WSS του γύρου"));
    for(const g of groups.filter(g=>g[0].protocol==="FDSN")){
      const host=new URL(g[0].url).host;
      if(!byHost.has(host))byHost.set(host,[]);
      byHost.get(host).push(g);
    }
    // Τέσσερις HTTP hosts ενεργοί ταυτόχρονα, μία ομαδική κλήση ανά host κάθε φορά.
    const hosts=[...byHost.entries()];
    const earthAt={20:13,30:20,45:35,60:49}[r.spin_seconds];
    const tasks=hosts.map(([host,batches])=>({host,batches,
      when:Math.max(r.start_ms-r.accepted_ms+r.duration*1000,
                    batches[0][0].provider==="earth"?earthAt*1000:batches[0][0].provider==="scedc"?5000:1200)}))
      .sort((a,b)=>a.when-b.when);
    let cursor=0;
    async function worker(){
      while(cursor<tasks.length){
        const task=tasks[cursor++];
        await wait(task.when-(performance.now()-anchor));
        for(const [i,rows] of task.batches.entries()){
          if(i)await wait(Math.min(remaining(),1500));
          if(remaining()<350){state(rows,"Εκτός διαθέσιμου χρόνου");continue;}
          if((cooldown.get(task.host)||0)>Date.now()){state(rows,"Σε αναμονή λόγω Retry-After / ορίου παρόχου");continue;}
          const begun=performance.now();
          const timeout=Math.floor(Math.min(remaining(),...rows.map(x=>x.timeout_ms)));
          state(rows,"Αίτημα FDSN");
          try{
            const response=await fetch(queryURL(rows,r),{mode:"cors",credentials:"omit",cache:"no-store",
                 referrerPolicy:"no-referrer",signal:AbortSignal.timeout(timeout)});
            if(response.status===429||response.status===503){
              const header=response.headers.get("Retry-After");
              const pause=header&&/^\d+$/.test(header)?Number(header)*1000:Date.parse(header)-Date.now();
              cooldown.set(task.host,Date.now()+Math.max(120000,pause||0));
            }
            state(rows,"HTTP "+response.status,{response_ms:Math.round(performance.now()-begun)});
            if(response.status!==200)continue;
            const raw=await boundedBody(response);
            state(rows,"HTTP 200",{response_ms:Math.round(performance.now()-begun)});
            if(remaining()>0){
              receive(rows,raw,false);
              for(const st of rows){
                const row=marks.get(st.key);
                if(row.status.state==="HTTP 200")row.status.state="HTTP 200 · κανένα δείγμα καναλιού";
              }
              update();
            }
          }catch(e){state(rows,e.name==="TimeoutError"?"Λήξη χρόνου":"Αποτυχία HTTPS/CORS",
                          {response_ms:Math.round(performance.now()-begun)});}
        }
      }
    }
    await Promise.all([...ws,...Array.from({length:Math.min(4,tasks.length)},worker)]);
    await wait(remaining());
    const selected=SeismoProof.pick(routes,candidates);
    const records={};
    for(const st of routes){
      const row=marks.get(st.key),raw=rawByRoute.get(st.key);
      if(raw&&st.redistribute){
        row.record_sha256=SeismoProof.hex(await SeismoProof.sha(raw));
        records[row.record_sha256]=SeismoProof.toBase64(raw);
      }
      if(row.complete){
        row.sample_sha256=SeismoProof.hex(await SeismoProof.sha(SeismoProof.word(candidates.get(st.key),true)));
        if(!st.redistribute){
          const equivalent=routes.find(x=>x.provider===st.provider&&x.id===st.id&&x.protocol==="FDSN");
          if(equivalent)row.source_url=queryURL([equivalent],r);
        }
      }
    }
    let result={state:"NO RESULT",used:[],reason:"Λιγότεροι από τρεις πλήρεις σταθμοί στο πάγωμα."};
    if(selected.length===3){
      result={state:"RESULT",used:selected.map(x=>x.key),...await SeismoProof.compute(r.start_ms,r.duration,
                selected,selected.map(x=>candidates.get(x.key)),r.algorithm)};
    }
    return {round:{...r,...result,routes:[...marks.values()]},records};
  }
  return {evaluate,queryURL};
})();
