import {readFile} from 'node:fs/promises';
import {runInThisContext} from 'node:vm';
import {makeContext, reserveRound, sealRound} from '../js/bundle.js';

for (const name of ['mseed', 'proof', 'live']) {
  const script = await readFile(new URL('../js/' + name + '.js', import.meta.url), 'utf8');
  runInThisContext(script, {filename: name + '.js'});
}
const readText = url => readFile(new URL(url, import.meta.url), 'utf8');
export const fixture = JSON.parse(await readText('./fixtures/noa-archive.json'));
export const context = await makeContext(...await Promise.all([readText('../data/stations-v1.1.0.txt'), readText('../data/rules.json')]));

export async function replayRecordedRound(dropRaw = false) {
  const accepted = fixture.start_ms - 10;
  const reserved = reserveRound(accepted, fixture.duration, 30, context);
  const complete = new Map();
  const attachments = new Map();
  const records = {};
  const routes = await Promise.all(context.stations.map(async station => {
    const source = fixture.routes.find(route => route.key === station.key);
    if (!source) return {key: station.key, complete: false, values_in_window: 0};
    const bytes = SeismoProof.fromBase64(source.miniSEED);
    const {values, count} = SeismoMseed.windowSamples(bytes, station, reserved.start_ms, reserved.duration);
    if (count !== station.hz * reserved.duration) throw new Error('test fixture coverage');
    complete.set(station.key, values);
    attachments.set(station.key, bytes);
    const record = SeismoProof.hex(await SeismoProof.sha(bytes));
    if (!dropRaw) records[record] = source.miniSEED;
    return {key: station.key, complete: true, values_in_window: count,
      ...(dropRaw ? {} : {record_sha256: record}), arrival_ms: accepted + 15500,
      sample_sha256: SeismoProof.hex(await SeismoProof.sha(SeismoProof.word(values, true)))};
  }));
  const used = SeismoProof.pick(context.stations, complete);
  const result = await SeismoProof.compute(reserved.start_ms, reserved.duration, used, used.map(s => complete.get(s.key)), reserved.algorithm);
  const seismic = {round: {...reserved, ...result, routes, state: 'RESULT', used: used.map(s => s.key)},
    records, stations_txt: context.catalogText};
  return {bundle: await sealRound(seismic, 'QC', context), attachments, used, complete};
}
