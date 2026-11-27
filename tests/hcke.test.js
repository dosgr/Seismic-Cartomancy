import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {createHash} from 'node:crypto';
import {context,replayRecordedRound} from './helpers.js';
import {makeContext,reserveRound,sealRound,verifyRound,HCKE_SCHEMA} from '../js/bundle.js';
import {readCards} from '../js/method.js';
import {produceNarrative} from '../js/narrative.js';
import {HCKE_FILES,buildHckeNarrative,planHcke} from '../js/hcke.js';
const get=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const rules=await get('data/rules.json');
const oldKnowledge=await get('data/knowledge.json');
const hcke=await Promise.all(HCKE_FILES.map(name=>get('data/hcke/'+name)));
const app=await makeContext(await get('stations.txt'),rules,oldKnowledge,hcke,context.catalogText);
const samples=JSON.parse(await get('tests/fixtures/hcke-comparisons.json')).cases;

test('approved corpus is complete and the full historical archive is unchanged',async()=>{
  const raw=await get('docs/historical/knowledge.json');
  assert.equal(createHash('sha256').update(raw).digest('hex'),'89ee0b03c44815c0b67445033fab732f8d67beec118d51bb284018ab8bc4728f');
  const corpus=JSON.parse(raw);
  assert.equal(corpus.entries.length+corpus.archival_positions.length,1326);
  for(const e of corpus.entries.filter(e=>e.category==='A')){
    const record=app.hcke.indexed[e.id];
    assert.deepEqual(record.conditions,e.conditions);
    assert.deepEqual(record.historical_gloss,e.reading);
  }
  assert.equal(app.hcke.active.editorial_refinements.length,43);
  assert.equal(app.hcke.active.optional_editorial_inspiration.length,13);
});

test('the 30 comparison cases preserve the exact cards and v1.1.0 text and run HCKE twice',async()=>{
  const covered=new Set();
  for(const fixture of samples){
    const {input,topic,shared_reading,v1}=fixture;
    const trace=await readCards(input.fingerprint,input.preferred,app.rules);
    assert.deepEqual(trace,shared_reading);
    assert.deepEqual(produceNarrative(trace,app,input.fingerprint),v1);
    const draft=await buildHckeNarrative(trace,app,input.fingerprint,topic);
    assert.deepEqual(draft,await buildHckeNarrative(trace,app,input.fingerprint,topic));
    assert.equal(draft.el.sections.length,draft.en.sections.length);
    assert.equal(draft.el.packets.length,4);
    assert.equal(draft.en.packets.length,4);
    assert.deepEqual(draft.plan.packets.map(p=>p.cards),trace.packs.map(p=>p.cards));
    draft.plan.recipes.forEach(rule=>covered.add(rule));
    assert.ok(draft.plan.directlyRead.every(id=>id.startsWith('A-')));
    assert.ok(draft.plan.sections.flatMap(s=>s.ids).every(id=>draft.plan.directlyRead.includes(id)));
    if(fixture.id==='02') assert.ok(draft.plan.sections.some(s=>s.ids.includes('A-P24')&&s.ids.includes('A-P37')));
    if(fixture.id==='14') assert.ok(draft.plan.sections.some(s=>s.recipes.includes('S-R01')));
    if(fixture.id==='29') assert.ok(draft.plan.stops.some(s=>s.mitigated.includes('4H')&&!s.mitigated.includes('JC')));
  }
  assert.ok(covered.size>=11, [...covered].join(','));
});

test('one thousand distinct deterministic fixture plans preserve every historical activation across themes',async()=>{
  const coverage=new Set();
  const uniquePlans=new Set();
  for(let i=0;i<1000;i++){
    const hash=createHash('sha256').update('hcke-coverage:'+i).digest('hex');
    const reel=await readCards(hash,'QC',app.rules);
    if(reel.state!=='RESULT') continue;
    const general=planHcke(reel,app,'general');
    const focussed=planHcke(reel,app,Object.keys(app.hcke.policy.topics)[1+i%9]);
    assert.deepEqual(focussed.stops,general.stops);
    assert.deepEqual(focussed.multiples,general.multiples);
    assert.deepEqual(focussed.pairs,general.pairs);
    assert.equal(new Set(focussed.pairs.map(e=>e.key)).size,focussed.pairs.length);
    for(const name of focussed.recipes) coverage.add(name);
    uniquePlans.add(reel.attempts.at(-1).fan.join(','));
  }
  assert.equal(coverage.size,15,[...coverage].sort().join(','));
  assert.ok(uniquePlans.size>970);
});

test('both proof formats replay, and changing topic or wording requires a new valid narrative',async()=>{
  const old=await replayRecordedRound();
  const betaFixture=await makeContext(context.catalogText,rules,oldKnowledge,hcke);
  // Use the recorded NOA waveforms with their exact catalogue and timestamp in a test-only beta context.
  const seismic=old.bundle.seismic;
  const oldResult=await verifyRound(old.bundle,old.attachments,app);
  assert.equal(oldResult.state,'RESULT');
  const oldRound=seismic.round;
  const next={...seismic,round:{...oldRound,...reserveRound(oldRound.accepted_ms,oldRound.duration,oldRound.spin_seconds,betaFixture)}};
  const a=await sealRound(next,'QC',betaFixture,'money');
  const b=await sealRound(next,'QC',betaFixture,'love');
  assert.equal(a.schema,HCKE_SCHEMA);
  assert.deepEqual(a.reading,b.reading);
  assert.notEqual(a.proof_sha256,b.proof_sha256);
  assert.equal((await verifyRound(a,old.attachments,betaFixture)).state,'RESULT');
  const missingHcke={...betaFixture,hcke:undefined};
  assert.equal((await verifyRound(a,old.attachments,missingHcke)).narrativeState,'UNAVAILABLE');
  a.narrative.en.conclusion+=' Tampered.';
  await assert.rejects(()=>verifyRound(a,old.attachments,betaFixture),/bundlehash/);
});
