import {narrativePanel} from './narrative-view.js?v=2.0.0';
import {renderCredits} from './credits.js?v=2.0.0';
import {loadContext, verifyRound, FILE_LIMIT, catalogContext} from './bundle.js?v=2.0.0';
import {dataselectRoute, evidenceUrl, evidenceGroups, obtainEvidence} from './evidence.js?v=2.0.0';
import {cardFace, renderReading} from './reading.js?v=2.0.0';
import {localize, tr, hasMessage, element} from './strings.js?v=2.0.0';

const byId = id => document.getElementById(id);
const input = byId('proof-file');
const status = byId('verify-status');
const evidence = byId('verify-evidence');
const output = byId('verify-output');
let context, bundle, result, transfer, notice = '', errorKey = '', checking = false, currentJob = 0;
const attachments = new Map();

function announce(key, tone = '') {
  const message = element('p', 'verify-state ' + tone, tr(key));
  status.replaceChildren(message);
}

async function verifiedRecording(bytes, station, round) {
  const row = round.routes.find(item => item.key === station.key);
  const actual = SeismoMseed.windowSamples(bytes, station, round.start_ms, round.duration);
  const fingerprint = SeismoProof.hex(await SeismoProof.sha(SeismoProof.word(actual.values, true)));
  return actual.count === station.hz * round.duration && fingerprint === row.sample_sha256;
}

async function retrieve(groupList) {
  const job = currentJob;
  const round = bundle.seismic.round;
  const handle = new AbortController();
  transfer = handle;
  notice = '';
  render();
  for (const group of groupList) {
    if (handle.signal.aborted) return;
    try {
      const downloaded = await obtainEvidence(group, round, handle.signal);
      for (const {station} of group) {
        const bytes = downloaded.get(station.key);
        if (bytes && await verifiedRecording(bytes, station, round) && job === currentJob) attachments.set(station.key, bytes);
      }
    } catch { /* The final check will identify anything still missing. */ }
  }
  if (job !== currentJob || handle.signal.aborted) return;
  transfer = null;
  notice = 'fetchSome';
  await check();
}

function render() {
  status.replaceChildren();
  evidence.replaceChildren();
  output.replaceChildren();
  if (checking) { announce('checking'); return; }
  if (errorKey) announce(errorKey, 'error');
  if (!result) return;

  if (result.state === 'MISSING') {
    announce(transfer ? 'fetching' : 'missing');
    if (notice && !transfer) evidence.append(element('p', 'field-note', tr(notice)));
    const routesContext = catalogContext(bundle.seismic.stations_txt, context);
    const groups = evidenceGroups(result.missing, routesContext);
    if (groups.length) {
      const fetchButton = element('button', 'quiet', tr('fetchEvidence'));
      fetchButton.type = 'button';
      fetchButton.disabled = Boolean(transfer);
      fetchButton.onclick = () => retrieve(groups);
      evidence.append(fetchButton);
    }
    for (const station of result.missing) {
      const control = element('div', 'evidence-row');
      const label = element('label', '', tr('attach') + ' · ' + station.id + ' · ' + station.provider);
      const file = element('input');
      file.type = 'file';
      file.disabled = Boolean(transfer);
      file.accept = '.mseed,.miniseed,.seed,application/octet-stream';
      file.addEventListener('change', async () => {
        if (!file.files[0]) return;
        const job = currentJob;
        if (file.files[0].size > FILE_LIMIT) { announce('size', 'error'); return; }
        try {
          const bytes = new Uint8Array(await file.files[0].arrayBuffer());
          if (job !== currentJob) return;
          const consistent = await verifiedRecording(bytes, station, bundle.seismic.round);
          if (job !== currentJob) return;
          if (!consistent) { announce('seismicproof', 'error'); return; }
          attachments.set(station.key, bytes);
          await check();
        } catch { if (job === currentJob) announce('seismicproof', 'error'); }
      });
      label.append(file);
      control.append(label);
      const route = dataselectRoute(station, routesContext);
      const url = route && evidenceUrl([route], bundle.seismic.round);
      if (url) {
        const link = element('a', '', tr('providerFile'));
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        control.append(link);
      }
      evidence.append(control);
    }
    return;
  }

  const match = {RESULT: 'verified', NO_FIGURE: 'verifiedNoFigure', NO_DATA: 'reportedNoData'};
  announce(match[result.state], result.state === 'NO_DATA' ? '' : 'success');
  output.append(element('p', 'field-note', tr('proofDigest') + ' · ' + bundle.proof_sha256));
  if (result.narrativeState==='UNAVAILABLE') output.append(element('p','field-note',tr('narrationUnavailable')));
  if (result.state === 'RESULT') {
    const cards = element('div', 'cards');
    const fan = result.reading.attempts.at(-1).fan;
    const highlight = step => {
      cards.replaceChildren(...fan.map(card => cardFace(card, {
        highlight: step && (card === step.card ? 'current'
          : [step.left, step.right].includes(card) ? 'neighbor' : '')
      })));
    };
    highlight();
    if (result.narrative) output.append(narrativePanel(result.narrative, context.knowledge, context.hcke));
    output.append(cards, renderReading(result.reading, context.rules, index => highlight(result.reading.steps[index])));
  }
}

async function check() {
  const job = ++currentJob;
  checking = true;
  errorKey = '';
  result = null;
  render();
  let outcome, message;
  try { outcome = await verifyRound(bundle, attachments, context); }
  catch (error) { message = hasMessage(error) ? error.message : 'invalid'; }
  if (job !== currentJob) return;
  checking = false;
  result = outcome;
  errorKey = message;
  render();
}

input.addEventListener('change', async () => {
  if (!input.files[0]) return;
  const job = ++currentJob;
  result = null;
  checking = false;
  errorKey = '';
  bundle = null;
  transfer?.abort();
  transfer = null;
  notice = '';
  attachments.clear();
  if (input.files[0].size > FILE_LIMIT) { errorKey = 'size'; render(); return; }
  let parsed;
  try { parsed = JSON.parse(await input.files[0].text()); }
  catch {
    if (job === currentJob) { errorKey = 'invalid'; render(); }
    return;
  }
  if (job !== currentJob) return;
  bundle = parsed;
  await check();
});
localize(() => { renderCredits(context?.knowledge); render(); });
try {
  if (!globalThis.crypto?.subtle) errorKey = 'crypto';
  else {
    context = await loadContext();
    input.disabled = false;
  }
} catch (error) {
  console.error(error);
  errorKey = 'resources';
}
render();

renderCredits(context?.knowledge);
