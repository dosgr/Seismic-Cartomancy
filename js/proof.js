"use strict";
const SeismoProof=(()=>{
  const encoder=new TextEncoder();
  const utf8=text=>encoder.encode(text);
  const sha=async bytes=>new Uint8Array(await crypto.subtle.digest("SHA-256",bytes));
  const hex=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,"0")).join("");
  const toBase64=bytes=>{
    let s="";
    for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));
    return btoa(s);
  };
  const fromBase64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const word=(values,signed=false)=>{
    const a=new Uint8Array(values.length*4),v=new DataView(a.buffer);
    values.forEach((n,i)=>signed?v.setInt32(i*4,n):v.setUint32(i*4,n));
    return a;
  };
  function join(parts){
    const buffer=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));
    let n=0;
    for(const p of parts){buffer.set(p,n);n+=p.length;}
    return buffer;
  }
  function parseCatalog(text){
    const lines=text.trimEnd().split(/\r?\n/),version=lines.shift().replace("# SEISMO stations v","");
    const head=lines.shift().split("\t");
    const rows=lines.map(line=>{
      const row=Object.fromEntries(line.split("\t").map((v,i)=>[head[i],v.replace(/^"(.*)"$/,"$1").replace(/""/g,'"')]));
      const priority=Number(row.priority);
      return {...row,key:row.provider+"~"+row.protocol+"~"+row.id,hz:Number(row.hz),
        lat:Number(row.latitude),lon:Number(row.longitude),priority,level:Math.floor(priority/1000),
        enabled:row.enabled==="1",browser:row.browser==="1",redistribute:row.redistribute==="1",
        timeout_ms:Number(row.timeout_ms)};
    });
    return {version,rows};
  }
  function pick(rows,candidates){
    const out=[],stations=new Set();
    const ordered=[...rows].sort((a,b)=>a.priority-b.priority||(a.key<b.key?-1:1));
    for(const row of ordered){
      const physical=row.id.split(".").slice(0,2).join(".");
      if(!candidates.has(row.key)||stations.has(physical)||
        out.some(item=>Math.abs(row.lat-item.lat)<.001&&Math.abs(row.lon-item.lon)<.001))continue;
      stations.add(physical);out.push(row);
      if(out.length===3)break;
    }
    return out;
  }
  function canonicalInput(start,duration,rows,series,algorithm){
    const parts=[utf8(algorithm+"\0"+new Date(start).toISOString()+"\0"),word([duration])];
    rows.forEach((r,i)=>parts.push(utf8(r.id+"\0"),word([r.hz]),word(series[i],true)));
    return join(parts);
  }
  async function compute(start,duration,rows,series,algorithm="SEISMO-P3"){
    const input=canonicalInput(start,duration,rows,series,algorithm);
    const fingerprint=hex(await sha(input));
    const payload=join([input,word([0])]),v=new DataView(payload.buffer);
    for(let counter=0;counter<2**32;counter++){
      v.setUint32(input.length,counter);
      const h=await sha(payload),index=h.findIndex(n=>n<222);
      if(index>=0)return {number:h[index]%37,input_sha256:fingerprint,digest:hex(h),counter,index,byte:h[index]};
    }
    throw Error("Εξαντλήθηκαν οι μετρητές.");
  }
  async function verify(bundle,attachments=new Map()){
    const r=bundle.round;
    if(!r||!Array.isArray(r.routes)||!["SEISMO-P3","SEISMO-P4"].includes(r.algorithm)||![1,3,5,10].includes(r.duration))
      throw Error("Άγνωστο αρχείο επαλήθευσης.");
    const spin=r.algorithm==="SEISMO-P4"?r.spin_seconds:20;
    if(![20,30,45,60].includes(spin))throw Error("Μη έγκυρη διάρκεια περιστροφής.");
    if(r.mode!=="archive"&& (r.start_ms!==(Math.floor(r.accepted_ms/10)+1)*10||
      r.freeze_ms!== (r.algorithm==="SEISMO-P4"?r.reveal_ms-2000:r.start_ms+17000)||r.reveal_ms!==r.accepted_ms+spin*1000))
      throw Error("Ασυμφωνία χρονικού παραθύρου.");
    if(hex(await sha(utf8(bundle.stations_txt)))!==r.catalog_sha256)throw Error("Ασυμφωνία SHA-256 καταλόγου.");
    const {version,rows}=parseCatalog(bundle.stations_txt);
    if(version!==r.catalog_version)throw Error("Ασυμφωνία έκδοσης καταλόγου.");
    const enabled=rows.filter(x=>r.mode==="browser"?(x.enabled&&x.browser):x.enabled);
    if(!["server","browser","archive"].includes(r.mode) ||
      new Date(r.start_ms).toISOString()!==r.start_utc ||
      new Date(r.start_ms+r.duration*1000).toISOString()!==r.end_utc)
      throw Error("Ασυμφωνία τύπου απόδειξης ή UTC.");
    const routeMap=new Map(enabled.map(s=>[s.key,s]));
    const evidence=new Set(r.routes.map(z=>z.key));
    if(evidence.size!==r.routes.length || (evidence.size && r.mode!=="archive" && evidence.size!==routeMap.size))
      throw Error("Ελλιπής ή διπλός πίνακας διαδρομών.");
    const present=new Map(),missing=[];
    for(const row of r.routes){
      const st=routeMap.get(row.key);
      if(!st||!Number.isInteger(st.hz)||st.hz<1||st.hz>1000)
        throw Error("Άγνωστη διαδρομή στην απόδειξη.");
      let bytes;
      if(row.record_sha256 && bundle.records?.[row.record_sha256]){
        bytes=fromBase64(bundle.records[row.record_sha256]);
        if(hex(await sha(bytes))!==row.record_sha256)throw Error("Ασυμφωνία miniSEED SHA-256.");
      }else if(row.complete){bytes=attachments.get(row.key);}
      if(!bytes){
        if(row.complete)missing.push(st);
        continue;
      }
      const decoded=SeismoMseed.windowSamples(bytes,st,r.start_ms,r.duration);
      if(row.complete!==(decoded.count===st.hz*r.duration))throw Error("Ασυμφωνία κάλυψης πηγής.");
      if(row.complete){
        if(hex(await sha(word(decoded.values,true)))!==row.sample_sha256)throw Error("Ασυμφωνία αποτυπώματος δειγμάτων.");
        present.set(st.key,decoded.values);
      }
    }
    if(missing.length)return {state:"ΕΛΛΙΠΗΣ",missing};
    const selected=pick(enabled,present);
    if(r.state==="NO RESULT"){
      if(selected.length===3)throw Error("Τρεις πλήρεις διαδρομές σε NO RESULT.");
      return {state:"NO RESULT",complete:present.size,unknown:r.routes.length===0};
    }
    if(r.state!=="RESULT"||JSON.stringify(selected.map(s=>s.key))!==JSON.stringify(r.used)||selected.length!==3)
      throw Error("Ασυμφωνία επιλογής σταθμών.");
    const checked=await compute(r.start_ms,r.duration,selected,selected.map(s=>present.get(s.key)),r.algorithm);
    for(const k of Object.keys(checked))if(checked[k]!==r[k])throw Error("Ασυμφωνία μαθηματικού αποτελέσματος.");
    return {state:"RESULT",...checked};
  }
  return {parseCatalog,pick,compute,verify,sha,hex,word,utf8,fromBase64,toBase64};
})();
