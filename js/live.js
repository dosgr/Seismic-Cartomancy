"use strict";
const SeismoLive=(()=>{
  const join=parts=>{
    const buf=new Uint8Array(parts.reduce((sum,v)=>sum+v.length,0));
    let offset=0;
    for(const v of parts){buf.set(v,offset);offset+=v.length;}
    return buf;
  };
  const utc=ms=>new Date(ms).toISOString();
  const policy="seismo-greek-first-1.1";
  const timing={
    1:[7000,5000], 2:[10000,4000], 3:[8500,3500], 4:[12000,3500], 5:[300000,5000]
  };
  const httpState={
    204:"HTTP 204 · Κενό χρονικό παράθυρο", 400:"HTTP 400 · Απορρίφθηκε το αίτημα",
    404:"HTTP 404 · Πόρος μη διαθέσιμος", 413:"HTTP 413 · Όριο μεγέθους αιτήματος"
  };
  const wait=ms=>new Promise(done=>setTimeout(done,Math.max(0,ms)));
  const cooldown=new Map();

  function routeGroups(routes){
    const map=new Map();
    for(const row of routes){
      const key=JSON.stringify([row.url,row.level]);
      if(!map.has(key))map.set(key,[]);
      map.get(key).push(row);
    }
    return [...map.values()];
  }
  function queryURL(rows,r){
    const ids=rows.map(s=>s.id.split("."));
    const by=(column)=>[...new Set(ids.map(parts=>parts[column]||"--"))].join(",");
    const args=new URLSearchParams({network:by(0),station:by(1),location:by(2),channel:by(3),
      starttime:r.start_utc,endtime:r.end_utc,nodata:"204"});
    return rows[0].url+"?"+args;
  }
  function plan(r,routes){
    const end=r.start_ms+r.duration*1000;
    const extended=r.spin_seconds===330;
    return routeGroups(routes).map(rows=>{
      const {level,protocol,url}=rows[0];
      const inactive=(!extended&&level===5)||(protocol==="WSS"&&!extended);
      const [pause,reserve]=timing[level]||[10000,5000];
      const send=inactive?null:protocol==="WSS"?r.accepted_ms:
        Math.max(end,Math.min(end+pause,r.freeze_ms-reserve));
      return {host:new URL(url).host,protocol,level,keys:rows.map(s=>s.key),send_ms:send};
    });
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
          if(decoded.lastSampleMs!==null){
            row.sample_age_ms=receivedMs-decoded.lastSampleMs;
            row.last_sample_utc=utc(decoded.lastSampleMs);
          }
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

    const routesByKey=new Map(routes.map(row=>[row.key,row]));
    const networkPlan=plan(r,routes);
    const ws=[];
    const hosts=new Map();
    const requests=[];
    for(const task of networkPlan){
      const rows=task.keys.map(key=>routesByKey.get(key));
      if(task.send_ms===null){state(rows,"Αρχειακή διαδρομή στον σύντομο γύρο");continue;}
      for(const row of rows)marks.get(row.key).planned_send_utc=utc(task.send_ms);
      if(task.protocol==="WSS"){
        if(!ws.length)ws.push(stream(rows,remaining(),remaining,receive,state));
        else state(rows,"Όριο WSS του γύρου");
        continue;
      }
      if(!hosts.has(task.host))hosts.set(task.host,[]);
      hosts.get(task.host).push({...task,rows});
    }
    let occupied=0;
    const queue=[];
    async function acquire(){
      if(occupied<4){occupied++;return;}
      await new Promise(resolve=>queue.push(resolve));
    }
    function release(){
      const next=queue.shift();
      if(next)next();
      else occupied--;
    }
    async function worker(tasks){
      for(const task of tasks.sort((a,b)=>a.send_ms-b.send_ms||a.level-b.level)){
        const rows=task.rows;
        await wait(task.send_ms-r.accepted_ms-(performance.now()-anchor));
        await acquire();
        const begun=performance.now();
        const sentMs=r.accepted_ms+Math.floor(begun-anchor);
        const timingInfo={requested_utc:utc(sentMs),request_after_window_ms:sentMs-r.start_ms-r.duration*1000};
        let attempt;
        try{
          if(remaining()<350){state(rows,"Εκτός διαθέσιμου χρόνου");continue;}
          if((cooldown.get(task.host)||0)>Date.now()){state(rows,"Σε αναμονή λόγω Retry-After / ορίου παρόχου");continue;}
          const readyGreek=()=>SeismoProof.pick(routes.filter(st=>st.country_code==="GR"),candidates).length===3;
          if(task.level>=4&&readyGreek()){state(rows,"Επαρκούν οι ελληνικοί σταθμοί");continue;}
          const timeout=Math.floor(Math.min(remaining(),...rows.map(x=>x.timeout_ms)));
          state(rows,"Αίτημα FDSN",timingInfo);
          const url=queryURL(rows,r);
          attempt={host:task.host,level:task.level,url,...timingInfo};
          requests.push(attempt);
          const response=await fetch(url,{mode:"cors",credentials:"omit",cache:"no-store",
            referrerPolicy:"no-referrer",signal:AbortSignal.timeout(timeout)});
          attempt.http_status=response.status;
          if(response.status===429||response.status===503){
            const header=response.headers.get("Retry-After");
            const pause=header&&/^\d+$/.test(header)?Number(header)*1000:Date.parse(header)-Date.now();
            cooldown.set(task.host,Date.now()+Math.max(120000,pause||0));
          }
          const observation={...timingInfo,http_status:response.status,response_ms:Math.round(performance.now()-begun)};
          state(rows,httpState[response.status]||"HTTP "+response.status,observation);
          if(response.status!==200)continue;
          const raw=await boundedBody(response);
          state(rows,"HTTP 200",{...observation,response_ms:Math.round(performance.now()-begun)});
          if(remaining()>0){
            receive(rows,raw,false);
            for(const st of rows){
              const row=marks.get(st.key);
              if(row.status.state==="HTTP 200")row.status.state="HTTP 200 · κανένα δείγμα καναλιού";
            }
            update();
          }
        }catch(e){
          const message=e.name==="TimeoutError"?"Λήξη χρόνου":
            e.message==="Υπέρβαση μεγέθους miniSEED"?e.message:"Αποτυχία HTTPS/CORS";
          if(attempt)attempt.error=message;
          state(rows,message,{...timingInfo,response_ms:Math.round(performance.now()-begun)});
        }finally{
          if(attempt)attempt.response_ms=Math.round(performance.now()-begun);
          release();
        }
      }
    }
    await Promise.all([...ws,...[...hosts.values()].map(worker)]);
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
    return {round:{...r,...result,network_plan:networkPlan,http_requests:requests,routes:[...marks.values()]},records};
  }
  return {evaluate,queryURL,plan,policy};
})();
