import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reserveRound, sealRound, verifyRound} from '../js/bundle.js';
import {context, replayRecordedRound} from './helpers.js';

test('independent verifier checks the result from actual miniSEED and catches altered proof fields', async () => {
  const {bundle} = await replayRecordedRound();
  const verified = await verifyRound(JSON.parse(JSON.stringify(bundle)), new Map(), context);
  assert.equal(verified.state, 'RESULT');
  assert.deepEqual(verified.reading, bundle.reading);
  const changed = structuredClone(bundle);
  changed.reading.packs[0].cards[0] = 'AD';
  await assert.rejects(verifyRound(changed, new Map(), context), /bundlehash/);
  const wrongCatalog = {...bundle, seismic: {...bundle.seismic, stations_txt: bundle.seismic.stations_txt + ' '}};
  await assert.rejects(verifyRound(wrongCatalog, new Map(), context), /cataloghash/);
  await assert.rejects(verifyRound({...bundle, rule_sha256: '0'.repeat(64)}, new Map(), context), /rulehash/);
});

test('missing miniSEED are named; correct attachments complete independent replay', async () => {
  const {bundle, attachments, used} = await replayRecordedRound(true);
  const missing = await verifyRound(bundle, new Map(), context);
  assert.equal(missing.state, 'MISSING');
  assert.deepEqual(missing.missing.map(route => route.key), used.map(route => route.key));
  assert.equal((await verifyRound(bundle, attachments, context)).state, 'RESULT');
  attachments.set(used[0].key, Uint8Array.of(1,2,3));
  await assert.rejects(verifyRound(bundle, attachments, context), /seismicproof/);
});

test('wrong waveform or inconsistent P4 output fails even in a freshly sealed bundle', async () => {
  const {bundle} = await replayRecordedRound();
  const corrupt = structuredClone(bundle.seismic);
  corrupt.round.number = (corrupt.round.number + 1) % 37;
  const sealed = await sealRound(corrupt, bundle.reading.preferred, context);
  await assert.rejects(verifyRound(sealed, new Map(), context), /seismicproof/);
  corrupt.round.routes.find(row => row.complete).arrival_ms = corrupt.round.freeze_ms + 1;
  const late = await sealRound(corrupt, bundle.reading.preferred, context);
  await assert.rejects(verifyRound(late, new Map(), context), /routes/);
});

test('insufficient collection issues a no-data proof and never deals', async () => {
  const accepted = Date.now();
  const round = reserveRound(accepted, 1, 20, context);
  assert.ok(round.start_ms > accepted && round.start_ms <= accepted + 10);
  assert.equal(round.start_ms % 10, 0);
  assert.equal(round.freeze_ms, accepted + 18000);
  const seismic = await SeismoLive.evaluate(round, [], () => {}, performance.now() - 18001);
  assert.equal(seismic.round.state, 'NO RESULT');
  seismic.stations_txt = context.catalogText;
  const bundle = await sealRound(seismic, 'QC', context);
  assert.deepEqual(bundle.reading, {state:'NO_DATA', preferred:'QC'});
  assert.equal((await verifyRound(bundle, new Map(), context)).state, 'NO_DATA');
});
