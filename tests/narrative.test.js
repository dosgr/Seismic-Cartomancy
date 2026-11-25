import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {context, replayRecordedRound} from './helpers.js';
import {makeContext, sealRound, verifyRound, NARRATIVE_SCHEMA, SCHEMA} from '../js/bundle.js';
import {readCards, readFan} from '../js/method.js';
import {makePlan, produceNarrative} from '../js/narrative.js';

const knowledgeText = await readFile(new URL('../data/knowledge.json',import.meta.url),'utf8');
const rulesText = await readFile(new URL('../data/rules.json',import.meta.url),'utf8');
const enhanced = await makeContext(context.catalogText,rulesText,knowledgeText);
const {knowledge,rules} = enhanced;

test('all historic signals have bilingual narrative or historical text, and comparative sources exist', () => {
  assert.equal(Object.keys(knowledge.cards).length,52);
  assert.equal(Object.keys(knowledge.pairs).length,72);
  assert.equal(Object.values(knowledge.multiples).flat().length,39);
  assert.equal(Object.keys(knowledge.sources).length,8);
  assert.equal(knowledge.comparative.length,23);
});

test('v2 verifies the narrative in both languages while v1 continues to verify the original cards', async () => {
  const {bundle} = await replayRecordedRound();
  const newer = await sealRound(bundle.seismic,bundle.reading.preferred,enhanced);
  assert.equal(newer.schema,NARRATIVE_SCHEMA);
  assert.deepEqual(newer.reading,bundle.reading);
  assert.equal(newer.narrative.el.packets.length,4);
  assert.equal(newer.narrative.en.packets.length,4);
  assert.deepEqual((await verifyRound(newer,new Map(),enhanced)).narrative,newer.narrative);
  assert.equal(bundle.schema,SCHEMA);
  assert.deepEqual((await verifyRound(bundle,new Map(),enhanced)).reading,bundle.reading);
  const changed = structuredClone(newer);
  changed.narrative.el.introduction+=' Άλλη εισαγωγή.';
  await assert.rejects(verifyRound(changed,new Map(),enhanced),/bundlehash/);
  const otherCorpus = await makeContext(context.catalogText,rulesText,knowledgeText+' ');
  await assert.rejects(verifyRound(newer,new Map(),otherCorpus),/knowledge/);
});

test('narrative uses historical contradictions and ranks, and attaches distinct comparative provenance', () => {
  const fan=['3D','10S','8D','KS','JD','QC','QH','AH','JH','AS','7H','9H'];
  const read={attempts:[{fan}],...readFan(fan,'3D',rules),packs:['personal','family','future','unexpected'].map((topic,i)=>({
    topic,cards:fan.slice(i*3,i*3+3)}))};
  const plan=makePlan(read,knowledge);
  assert.ok(plan.all.some(r=>r.id==='P24'));
  assert.ok(plan.all.some(r=>r.id==='P37'));
  assert.ok(plan.all.some(r=>r.type==='multiple'));
  assert.ok(plan.comparative.some(id=>knowledge.comparative.find(row=>row.id===id).relation==='alternative'));
  assert.ok(plan.all.every(item=>item.cards.every(card=>fan.includes(card))));
});

test('256 test openings have grounded, varied, deterministic bilingual narratives', async () => {
  const keys = new Set(), intros=new Set(), conclusions=new Set();
  let contrasting=0, spreadCount=0, variable=false;
  const lengths=new Set();
  for(let i=0;i<256;i++){
    const digest=createHash('sha256').update('test-fixture:'+i).digest('hex');
    const reading=await readCards(digest,'QC',rules);
    if(reading.state!=='RESULT')continue;
    const n=produceNarrative(reading,enhanced,digest);
    assert.deepEqual(n,produceNarrative(reading,enhanced,digest));
    assert.equal(n.el.sections.length,n.en.sections.length);
    assert.ok(n.plan.sections.every(section=>section.ids.every(id=>n.plan.signals.some(s=>s.id===id))));
    const fan=reading.attempts.at(-1).fan;
    assert.ok(n.plan.signals.every(signal=>signal.cards.every(card=>fan.includes(card))));
    for (const lang of ['el','en']) for (const section of [...n[lang].sections,...n[lang].packets]) {
      assert.ok(section.text.length>18);
      assert.doesNotMatch(section.text,/undefined|null|\[object Object\]/);
    }
    if(n.plan.sections.some(s=>s.contrast))contrasting++;
    lengths.add(n.el.sections.length);
    keys.add(n.en.sections.map(s=>s.text).join('/'));
    intros.add(n.el.introduction);
    conclusions.add(n.en.conclusion);
    spreadCount++;
  }
  variable=lengths.size>1;
  assert.ok(spreadCount>=250);
  assert.ok(keys.size>=248);
  assert.ok(intros.size>=12);
  assert.ok(conclusions.size>=3);
  assert.ok(contrasting>=20);
  assert.ok(variable);
});
