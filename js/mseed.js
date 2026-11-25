"use strict";
// miniSEED 2: επιλογή ακέραιων κωδικοποιήσεων, Steim-1 και Steim-2.
const SeismoMseed=(()=>{
  const NS=1000000000n;
  const ascii=new TextDecoder("ascii");
  function signed(value,bits){
    const base=2**bits;
    return value>=base/2?value-base:value;
  }
  function seedRate(f,m){
    if(!f||!m)return 0;
    return (f<0?-1/f:f)*(m<0?-1/m:m);
  }
  function unpack(view,data,end,encoding,little,count){
    if(encoding===1 || encoding===3){
      const width=encoding===1?2:4, get=encoding===1?"getInt16":"getInt32";
      if(data+count*width>end)throw Error("Ελλιπής εγγραφή ακεραίων.");
      return Int32Array.from({length:count},(_,i)=>view[get](data+i*width,little));
    }
    if(encoding!==10 && encoding!==11)throw Error("Μη υποστηριζόμενη κωδικοποίηση miniSEED 2.");
    if(data+64>end)throw Error("Ατελές πλαίσιο Steim.");
    const output=new Int32Array(count);
    if(!count)return output;
    let n=1,firstDiff=true,value=view.getInt32(data+4,little);
    output[0]=value;
    const last=view.getInt32(data+8,little);
    for(let frame=data;frame+64<=end && n<count;frame+=64){
      const control=view.getUint32(frame,little);
      for(let w=frame===data?3:1;w<16 && n<count;w++){
        const code=(control>>>(30-2*w))&3;
        if(!code)continue;
        const word=view.getUint32(frame+4*w,little),dnib=word>>>30;
        let size, groups;
        if(code===1){size=8;groups=4;}
        else if(encoding===10){size=code===2?16:32;groups=32/size;}
        else if(code===2){size=[0,30,15,10][dnib];groups=dnib;}
        else{size=[6,5,4,0][dnib];groups=[5,6,7,0][dnib];}
        if(!size)throw Error("Μη έγκυρο πλαίσιο Steim.");
        for(let j=groups-1;j>=0 && n<count;j--){
          const diff=signed(size===32?word:(word>>>(size*j))&(2**size-1),size);
          if(firstDiff){firstDiff=false;continue;}
          value=(value+diff)|0;
          output[n++]=value;
        }
      }
    }
    if(n!==count || value!==last)throw Error("Ασυμφωνία αποκωδικοποίησης Steim.");
    return output;
  }
  function parse(bytes,decodeValues=true){
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    const strings=(p,n)=>ascii.decode(bytes.subarray(p,p+n)).trim();
    const out=[];
    for(let p=0;p<bytes.length;){
      if(p+48>bytes.length)throw Error("Ελλιπής κεφαλίδα miniSEED.");
      const big=view.getUint16(p+20), littleYear=view.getUint16(p+20,true);
      const little=!(big>=1900&&big<=2600) && littleYear>=1900&&littleYear<=2600;
      const u16=n=>view.getUint16(p+n,little);
      const i16=n=>view.getInt16(p+n,little);
      const year=u16(20),day=u16(22);
      if(year<1900||year>2600||day<1||day>366)throw Error("Μη έγκυρη ημερομηνία miniSEED.");
      const id=[strings(p+18,2),strings(p+8,5),strings(p+13,2),strings(p+15,3)].join(".");
      const dayMs=Date.UTC(year,0,day,view.getUint8(p+24),view.getUint8(p+25),view.getUint8(p+26));
      let start=BigInt(dayMs)*1000000n+BigInt(u16(28))*100000n;
      if(!(view.getUint8(p+36)&2))start+=BigInt(view.getInt32(p+40,little))*100000n;
      let hz=seedRate(i16(32),i16(34)), len=0,encoding,payloadLittle=false;
      const data=u16(44);
      for(let off=u16(46),n=0;off&&n<64;n++){
        if(off<48 || off+8>data || p+off+8>bytes.length)throw Error("Μη έγκυρο blockette.");
        const type=u16(off),next=u16(off+2);
        if(type===100){hz=view.getFloat32(p+off+4,little);}
        if(type===1000){
          encoding=view.getUint8(p+off+4);
          payloadLittle=view.getUint8(p+off+5)===0;
          len=2**view.getUint8(p+off+6);
        }
        if(type===1001)start+=BigInt(view.getInt8(p+off+5))*1000n;
        if(next!==0&&next<=off)throw Error("Λανθασμένη αλυσίδα blockette.");
        off=next;
      }
      if(!len||len>1048576||p+len>bytes.length||data<48||data>len||!Number.isInteger(hz)||hz<1)
        throw Error("Μη υποστηριζόμενη διάταξη ή συχνότητα miniSEED.");
      const n=u16(30);
      if(n)out.push({id,start,hz,count:n,raw:bytes.subarray(p,p+len),values:decodeValues?unpack(view,p+data,p+len,encoding,payloadLittle,n):null});
      p+=len;
    }
    if(!out.length)throw Error("Κενό miniSEED.");
    return out;
  }
  function windowSamples(bytes,row,startMs,duration){
    const n=row.hz*duration,values=new Int32Array(n),mask=new Uint8Array(n);
    const timestamps=[];
    const hz=BigInt(row.hz);
    for(const segment of parse(bytes)){
      if(segment.id!==row.id||segment.hz!==row.hz)throw Error("Ασυμφωνία καναλιού ή Hz.");
      const index=(segment.start-BigInt(startMs)*1000000n)*BigInt(row.hz);
      const offset=Number(index>=0n?index/NS:(index-(NS-1n))/NS);
      const a=Math.max(0,offset),b=Math.min(n,offset+segment.values.length);
      for(let i=a;i<b;i++){
        const v=segment.values[i-offset];
        const time=segment.start+BigInt(i-offset)*NS/hz;
        if(timestamps[i]===undefined||time>timestamps[i])timestamps[i]=time;
        if(mask[i]&&v!==values[i])mask[i]=2;
        else if(!mask[i])mask[i]=1;
        values[i]=v;
      }
    }
    const latest=timestamps.reduce((latest,time,i)=>mask[i]===1&&time>latest?time:latest,0n);
    return {values,count:mask.reduce((total,m)=>total+(m===1),0),mask,
      lastSampleMs:latest?Number(latest)/1000000:null};
  }
  return {parse,windowSamples};
})();
