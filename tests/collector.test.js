import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import vm from 'node:vm';
import './helpers.js';

const get=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const catalogue=SeismoProof.parseCatalog(await get('stations.txt'));
const active=catalogue.rows.filter(r=>r.enabled&&r.browser);
test('verified country and physical priority is Greek-only then mixed then international',()=>{
  const [gr,other,duplicate,jp,de]=[
    {...active[0],country_code:'GR',key:'gr1',physical_id:'real',priority:2000},
    {...active[1],country_code:'GR',key:'gr2',physical_id:'other',priority:2100},
    {...active[0],country_code:'GR',key:'duplicate',physical_id:'real',priority:2200},
    {...active[2],country_code:'JP',key:'jp',physical_id:'jp',priority:1000},
    {...active[3],country_code:'DE',key:'de',physical_id:'de',priority:1100}
  ];
  const third={...active[4],country_code:'GR',key:'gr3',physical_id:'third',priority:2300};
  const intl={...active[5],country_code:'FR',key:'intl',physical_id:'intl',priority:3100};
  const pool=[gr,other,duplicate,jp,de,third,intl];
  const pick=keys=>SeismoProof.pick(pool,new Map(keys.map(x=>[x,true]))).map(r=>r.key);
  assert.deepEqual(pick(pool.map(r=>r.key)),['gr1','gr2','gr3']);
  assert.deepEqual(pick(['gr1','gr2','duplicate','jp','de']),['gr1','gr2','jp']);
  assert.deepEqual(pick(['gr1','duplicate','jp','de']),['gr1','jp','de']);
  assert.deepEqual(pick(['jp','de','intl']),['jp','de','intl']);
});

test('upstream timing schedules exact-window queries and reserves tier 5 for extended rounds',async()=>{
  const vmContext=vm.createContext({URL,URLSearchParams});
  vm.runInContext(await get('js/live.js'),vmContext);
  const live=vm.runInContext('SeismoLive',vmContext);
  const now=1_000_000;
  const r={accepted_ms:now,start_ms:now+10,freeze_ms:now+18000,spin_seconds:20,duration:5,
    start_utc:new Date(now+10).toISOString(),end_utc:new Date(now+5010).toISOString()};
  const plan=live.plan(r,active);
  assert.ok(plan.every(group=>group.send_ms===null||group.send_ms>=r.start_ms+r.duration*1000));
  assert.ok(plan.filter(x=>x.level===5||x.protocol==='WSS').every(x=>x.send_ms===null));
  const long=live.plan({...r,spin_seconds:330,freeze_ms:now+328000},active);
  assert.ok(long.filter(x=>x.level===5).every(x=>x.send_ms>=now+300000));
  const first=active.find(x=>x.country_code==='GR'&&x.provider==='earth');
  assert.equal(new URL(live.queryURL([first],r)).searchParams.get('starttime'),r.start_utc);
  assert.equal(new URL(live.queryURL([first],r)).searchParams.get('endtime'),r.end_utc);
});

test('204, 404, 503 and timeout responses leave an honest no-result round',async()=>{
  const statuses=[204,404,503,'timeout'];
  let calls=0;
  const rate=50, start=performance.now();
  const groups=active.slice(0,4).map((route,i)=>({...route,protocol:'FDSN',level:1,
    url:'https://station-'+i+'.example.test/query'}));
  const c=vm.createContext({URL,URLSearchParams,AbortSignal,performance:{now:()=>(performance.now()-start)*rate},
    setTimeout:(fn,ms)=>setTimeout(fn,Math.max(0,ms/rate)),
    SeismoProof,
    fetch:async ()=>{
      const status=statuses[calls++];
      if(status==='timeout') throw Object.assign(Error('test timeout'),{name:'TimeoutError'});
      return new Response(null,{status});
    }
  });
  vm.runInContext(await get('js/live.js'),c);
  const live=vm.runInContext('SeismoLive',c);
  const now=Date.now();
  const begin=c.performance.now();
  const r={accepted_ms:now,start_ms:now+10,freeze_ms:now+18000,spin_seconds:20,duration:1,
    start_utc:new Date(now+10).toISOString(),end_utc:new Date(now+1010).toISOString()};
  const res=await live.evaluate(r,groups,()=>{},begin);
  assert.equal(res.round.state,'NO RESULT');
  assert.equal(res.round.used.length,0);
  assert.deepEqual([...res.round.http_requests.map(x=>x.http_status).filter(Boolean)].sort((a,b)=>a-b),[204,404,503]);
  assert.ok(res.round.http_requests.some(x=>x.error==='Λήξη χρόνου'));
});
