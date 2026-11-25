/** Generate the supplied sample reading document from actual application code. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {context,replayRecordedRound} from './helpers.js';
import {makeContext,sealRound} from '../js/bundle.js';
import {readCards} from '../js/method.js';
import {produceNarrative} from '../js/narrative.js';
const data = name => readFile(new URL('../data/'+name+'.json',import.meta.url),'utf8');
const active = await makeContext(context.catalogText,await data('rules'),await data('knowledge'));
const {bundle} = await replayRecordedRound();
if (process.argv[2]) {
  const updated = await sealRound(bundle.seismic,bundle.reading.preferred,active);
  await writeFile(process.argv[2]+'/seismo-legacy-test.json',JSON.stringify(bundle));
  await writeFile(process.argv[2]+'/seismo-1.1-test.json',JSON.stringify(updated));
}
let text='# Ενδεικτικές αναγνώσεις / Sample readings\n\nΠαραγμένα κείμενα από την έκδοση 1.1.0. Το Α προέρχεται από το αρχειακό fixture του NOA. Τα υπόλοιπα χρησιμοποιούν συνθετικές εισόδους ανάπτυξης αποκλειστικά για έλεγχο.\n';
const samples=[bundle.seismic.round.input_sha256,...[2,17,67].map(n=>createHash('sha256').update('test-fixture:'+n).digest('hex'))];
for(const [i,digest] of samples.entries()){
  const reading=await readCards(digest,'QC',active.rules);
  const narrative=produceNarrative(reading,active,digest);
  text+='\n## '+String.fromCharCode(65+i)+' · '+reading.attempts.at(-1).fan.join(' · ')+'\n';
  for(const lang of ['el','en']){
    const item=narrative[lang];
    text+='\n### '+lang.toUpperCase()+'\n\n'+item.introduction+'\n';
    for(const row of [...item.sections,...item.packets])text+='\n**'+row.heading+'**\n\n'+row.text+'\n';
    text+='\n'+item.conclusion+'\n';
  }
}
await writeFile(new URL('../docs/EXAMPLES.md',import.meta.url),text);
