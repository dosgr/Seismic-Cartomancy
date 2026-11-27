import {buildHckeNarrative, HCKE_FILES, validateHcke} from './hcke.js?v=2.0.0';
import {produceNarrative, validateKnowledge} from './narrative.js?v=2.0.0';
import {METHOD_VERSION, FIGURES, readCards, validateRules} from './method.js?v=2.0.0';

export const SCHEMA = 'seismo-cards-proof.v1';
export const NARRATIVE_SCHEMA = 'seismo-cards-proof.v2';
export const HCKE_SCHEMA = 'seismo-cards-proof.v3';
const NETWORK_POLICY = 'seismo-greek-first-1.1';
export const DURATIONS = [1, 3, 5, 10];
export const SPIN_SECONDS = [20, 30, 45, 60, 330];
export const LEGAL_RECORD_NETWORKS = ['HL', 'GE', 'CL'];
export const FILE_LIMIT = 60 * 1024 * 1024;
const shaText = async text => SeismoProof.hex(await SeismoProof.sha(SeismoProof.utf8(text)));

function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

export function selectRoutes(catalogText) {
  if (!catalogText.startsWith('# SEISMO stations v')) throw new Error('catalog');
  const {version, rows} = SeismoProof.parseCatalog(catalogText);
  const stations = rows.filter(s => s.enabled && s.browser);
  const keys = new Set();
  for (const station of stations) {
    const url = new URL(station.url);
    const protocol = {FDSN: 'https:', WSS: 'wss:'}[station.protocol];
    if (!protocol || url.protocol !== protocol || url.username || url.password || url.search || url.hash ||
      keys.has(station.key) || !/^[A-Z0-9]+\.[A-Z0-9]+\.[A-Z0-9]*\.[A-Z0-9]{3}$/.test(station.id) ||
      !Number.isInteger(station.hz) || station.hz < 1 || station.hz > 1000 ||
      !Number.isFinite(station.lat) || !Number.isFinite(station.lon) || !Number.isInteger(station.priority) ||
      !Number.isInteger(station.timeout_ms) || station.timeout_ms < 350 || station.timeout_ms > 30000) {
      throw new Error('catalog');
    }
    keys.add(station.key);
    if (station.redistribute && !LEGAL_RECORD_NETWORKS.includes(station.id.split('.')[0])) {
      throw new Error('redistribution');
    }
  }
  if (!stations.length) throw new Error('catalog');
  stations.sort((a, b) => a.priority - b.priority || (a.key < b.key ? -1 : 1));
  return {version, stations};
}

export async function makeContext(catalogText, rulesText, knowledgeText, hckeTexts, legacyText) {
  const rules = validateRules(JSON.parse(rulesText));
  return {
    ...selectRoutes(catalogText), catalogText, catalogHash: await shaText(catalogText),
    rules, rulesHash: await shaText(rulesText),
    ...(legacyText===undefined ? {} : {legacy:await makeContext(legacyText,rulesText,knowledgeText)}),
    ...(hckeTexts===undefined ? {} : {hcke:validateHcke(hckeTexts.map(JSON.parse),rules),
      hckeHash:await shaText(canonical(hckeTexts)),
      networkPolicy:NETWORK_POLICY}),
    ...(knowledgeText === undefined ? {} : {knowledge:validateKnowledge(JSON.parse(knowledgeText),rules),
      knowledgeHash:await shaText(knowledgeText)})
  };
}

export async function loadContext() {
  const read = async path => {
    const url = new URL(path, import.meta.url);
    url.search = new URL(import.meta.url).search;
    const response = await fetch(url);
    if (!response.ok) throw new Error('resources');
    return response.text();
  };
  const [catalog,rules,knowledge,legacy,hcke] = await Promise.all([read('../stations.txt'), read('../data/rules.json'),
    read('../data/knowledge.json'), read('../data/stations-v1.1.0.txt'),
    Promise.all(HCKE_FILES.map(file=>read('../data/hcke/'+file))).catch(()=>undefined)]);
  const context = await makeContext(catalog,rules,knowledge,hcke,legacy);
  context.networkPolicy = NETWORK_POLICY;
  return context;
}

export function reserveRound(accepted, duration, seconds, context) {
  const start = (Math.floor(accepted / 10) + 1) * 10;
  const reveal = accepted + seconds * 1000;
  return {
    id: 'cards-' + accepted, mode: 'browser', ...(context.networkPolicy?{network_policy:context.networkPolicy}:{}), algorithm: 'SEISMO-P4',
    duration, spin_seconds: seconds, accepted_ms: accepted, start_ms: start,
    start_utc: new Date(start).toISOString(), end_utc: new Date(start + duration * 1000).toISOString(),
    reveal_ms: reveal, freeze_ms: reveal - 2000, catalog_version: context.version,
    catalog_sha256: context.catalogHash
  };
}

export async function sealRound(seismic, preferred, context, topic='general') {
  const reading = seismic.round.state === 'RESULT'
    ? await readCards(seismic.round.input_sha256, preferred, context.rules)
    : {state: 'NO_DATA', preferred};
  const body = {
    schema: SCHEMA, method: METHOD_VERSION, rules: context.rules.version,
    rule_sha256: context.rulesHash, seismic, reading
  };
  if (context.hcke && reading.state === 'RESULT' && seismic.round.network_policy===NETWORK_POLICY) {
    body.schema = HCKE_SCHEMA;
    body.narrative = await buildHckeNarrative(reading,context,seismic.round.input_sha256,topic);
  } else if (context.knowledge && reading.state === 'RESULT') {
    body.schema = NARRATIVE_SCHEMA;
    body.narrative = produceNarrative(reading, context, seismic.round.input_sha256);
  }
  return {...body, proof_sha256: await shaText(canonical(body))};
}

export function catalogContext(text,context) {
  if (text===context.catalogText) return context;
  if (context.legacy && text===context.legacy.catalogText) return context.legacy;
  return null;
}

const fail = code => { throw new Error(code); };

export async function verifyRound(bundle, attachments, context) {
  const {schema, method, rules, rule_sha256, seismic, reading, narrative, proof_sha256, ...extra} = bundle ?? {};
  if (![SCHEMA,NARRATIVE_SCHEMA,HCKE_SCHEMA].includes(schema) ||
    (schema === SCHEMA && narrative !== undefined) || (schema !== SCHEMA && !narrative) || method !== METHOD_VERSION || !seismic?.round || !seismic.records ||
    !FIGURES.includes(reading?.preferred) || typeof proof_sha256 !== 'string' || Object.keys(extra).length) fail('format');
  if (rules !== context.rules.version || rule_sha256 !== context.rulesHash) fail('rulehash');
  const round = seismic.round;
  if (!round) fail('format');
  const released = catalogContext(seismic.stations_txt,context);
  if (!released || (schema===HCKE_SCHEMA && round.network_policy!==NETWORK_POLICY) ||
      (round.network_policy??null)!==(released.networkPolicy??null)) fail('cataloghash');
  if (round.mode !== 'browser' || round.algorithm !== 'SEISMO-P4' ||
    !Number.isSafeInteger(round.accepted_ms) || !DURATIONS.includes(round.duration) ||
    !SPIN_SECONDS.includes(round.spin_seconds) || (round.spin_seconds===330 && !released.networkPolicy) || !Array.isArray(round.routes) ||
    !Array.isArray(round.used) || !['RESULT', 'NO RESULT'].includes(round.state)) fail('round');
  const reserved = reserveRound(round.accepted_ms, round.duration, round.spin_seconds, released);
  if (Object.keys(reserved).some(key => reserved[key] !== round[key])) fail('round');
  if (round.state === 'NO RESULT' && round.used.length) fail('round');

  const routeIndex = new Map(released.stations.map(row => [row.key, row]));
  const allowedRecords = new Set();
  for (const row of round.routes) {
    const station = routeIndex.get(row.key);
    if (!station || typeof row.complete !== 'boolean' ||
      row.complete && (!Number.isSafeInteger(row.arrival_ms) || row.arrival_ms < round.accepted_ms ||
        row.arrival_ms > round.freeze_ms || row.values_in_window !== station.hz * round.duration)) fail('routes');
    if (row.record_sha256) {
      if (!station.redistribute || !/^[0-9a-f]{64}$/.test(row.record_sha256)) fail('records');
      allowedRecords.add(row.record_sha256);
    }
  }
  if (!Object.keys(seismic.records).every(hash => allowedRecords.has(hash))) fail('records');

  try {
    if (await shaText(canonical({schema, method, rules, rule_sha256, seismic, reading, ...(narrative ? {narrative} : {})})) !== proof_sha256) {
      fail('bundlehash');
    }
  } catch (error) {
    if (error.message === 'bundlehash') throw error;
    fail('format');
  }

  const checked = await SeismoProof.verify(seismic, attachments).catch(() => fail('seismicproof'));
  if (checked.state === 'ΕΛΛΙΠΗΣ') return {state: 'MISSING', missing: checked.missing};
  const expected = round.state === 'RESULT'
    ? await readCards(checked.input_sha256, reading.preferred, context.rules)
    : {state: 'NO_DATA', preferred: reading.preferred};
  if (canonical(reading) !== canonical(expected)) fail('reading');
  if (schema === NARRATIVE_SCHEMA) {
    if (!context.knowledge || expected.state !== 'RESULT' ||
      narrative.knowledge_sha256 !== context.knowledgeHash ||
      canonical(narrative) !== canonical(produceNarrative(expected,context,checked.input_sha256))) fail('knowledge');
  }
  if (schema === HCKE_SCHEMA) {
    if (expected.state!=='RESULT' || typeof narrative.topic!=='string') fail('knowledge');
    if (!context.hcke || narrative.knowledge_sha256!==context.hckeHash) {
      return {state:expected.state,reading:expected,narrativeState:'UNAVAILABLE'};
    }
    if (canonical(narrative)!==canonical(await buildHckeNarrative(expected,context,checked.input_sha256,narrative.topic))) fail('knowledge');
  }
  return {state: expected.state, reading: expected, ...(narrative ? {narrative} : {})};
}
