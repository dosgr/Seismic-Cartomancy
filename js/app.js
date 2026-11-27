import './donate.js?v=2.0.0';
import {narrativePanel} from './narrative-view.js?v=2.0.0';
import {renderCredits} from './credits.js?v=2.0.0';
import {loadContext, reserveRound, sealRound} from './bundle.js?v=2.0.0';
import {FIGURES} from './method.js?v=2.0.0';
import {cardFace, renderReading} from './reading.js?v=2.0.0';
import {cardName, tr, localize, element, stored, store, routeLabel, currentLanguage} from './strings.js?v=2.0.0';

const byId = id => document.getElementById(id);
const form = byId('start-form');
const figure = byId('figure');
const theme = byId('reading-theme');
const stageNames = ['collect', 'shuffle', 'cut', 'deal', 'count', 'packets'];
const reducedPref = matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = stored('reduced-motion') === 'true' || reducedPref.matches;
let context, proof, reserved, animation, waveKey;
let active = false, stage = -1, stop = -1, deadline = 0;
let currentStatus = 'idle', bootError = '', arrangement = 'waiting', counter = '';
let routes = [], shownFan = [];

function renderForm() {
  const preferred = figure.value || stored('figure');
  const blank = element('option', '', tr('choose'));
  blank.value = '';
  blank.disabled = true;
  figure.replaceChildren(blank, ...FIGURES.map(card => {
    const option = element('option', '', cardName(card));
    option.value = card;
    return option;
  }));
  figure.value = FIGURES.includes(preferred) ? preferred : '';
  byId('start').textContent = tr(proof ? 'again' : 'start');
  byId('boot-status').textContent = bootError ? tr(bootError) : '';
  byId('start').disabled = active || !context;
  const topic = theme.value || stored('theme') || 'general';
  const topics = context?.hcke?.policy.topics ?? {general:{el:'Γενική ανάγνωση',en:'General reading'}};
  theme.replaceChildren(...Object.entries(topics).map(([id,label])=>{
    const option=element('option','',label[currentLanguage()]);
    option.value=id;
    return option;
  }));
  theme.value = Object.hasOwn(topics,topic) ? topic : 'general';
  theme.disabled = active;
  figure.disabled = active;
  byId('duration').disabled = active;
  byId('round-seconds').disabled = active;
}

function renderStage() {
  const list = stageNames.map((name, i) => {
    const item = element('li', i < stage ? 'done' : '', tr(name));
    if (i === stage) item.setAttribute('aria-current', 'step');
    return item;
  });
  byId('progress').replaceChildren(...list);
  byId('round-status').textContent = tr(stage === -1 && figure.value ? 'idleSelected' : currentStatus);
  let note = '';
  const latest = proof?.reading.attempts?.at(-1);
  if (currentStatus === 'cutting' && latest) note = latest.cut52 + ' / 52';
  if (currentStatus === 'cut12') note = proof.reading.cut12 + ' / 12';
  if (currentStatus === 'counting' && stop >= 0) {
    const step = proof.reading.steps[stop];
    note = tr('stop') + ' ' + (stop + 1) + ' / 7' + ' · ' + cardName(step.card);
  }
  byId('surface-label').textContent = tr(arrangement === 'pack-deal' ? 'packTable' : 'fan');
  if (currentStatus === 'retry') note = tr('attempts') + ' · ' + counter;
  byId('round-note').textContent = note;
  byId('stage-counter').textContent = counter;
  byId('round-actions').hidden = active || !proof;
  byId('motion').setAttribute('aria-pressed', String(reduceMotion));
  document.documentElement.classList.toggle('reduce-motion', reduceMotion);
}

function renderCards() {
  const fan = byId('cards');
  fan.className = 'cards ' + arrangement;
  const current = stop < 0 ? null : proof?.reading.steps?.[stop];
  const cards = shownFan.length ? shownFan : Array(12).fill(null);
  let index = -1;
  fan.replaceChildren(...cards.map(card => {
    index++;
    const highlight = current && card && (card === current.card ? 'current'
      : [current.left, current.right].includes(card) ? 'neighbor' : '');
    return cardFace(card, {index, animation: ['dealing', 'pack-deal'].includes(arrangement) ? 'reveal' : '', highlight});
  }));
}

function drawWave(row) {
  const canvas = byId('wave');
  const ctx = canvas.getContext('2d');
  const {width, height} = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = '#59414a';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  if (!row?.wave) return;
  const valid = row.wave.filter(Number.isFinite);
  if (!valid.length) return;
  const mean = valid.reduce((sum, x) => sum + x, 0) / valid.length;
  const scale = Math.max(1, ...valid.map(x => Math.abs(x - mean)));
  const widthStep = width / Math.max(1, row.wave.length - 1);
  ctx.strokeStyle = '#a6d6be';
  ctx.lineWidth = 2;
  ctx.beginPath();
  let previous = false;
  row.wave.forEach((value, i) => {
    if (!Number.isFinite(value)) { previous = false; return; }
    const y = height / 2 - (value - mean) / scale * height * .42;
    if (previous) ctx.lineTo(widthStep * i, y); else ctx.moveTo(widthStep * i, y);
    previous = true;
  });
  ctx.stroke();
}

function renderTelemetry() {
  const seismic = proof?.seismic.round;
  const complete = routes.filter(row => row.complete).length;
  const telemetry = byId('telemetry-counts');
  telemetry.replaceChildren(element('span', '', tr(seismic ? 'selectedSites' : 'fullRoutes')),
    element('strong', '', seismic ? '' + seismic.used.length : complete + ' / ' + (context?.stations.length ?? '–')));
  if (seismic?.used.length) {
    const greek=seismic.used.filter(key=>context.stations.find(station=>station.key===key)?.country_code==='GR').length;
    telemetry.append(element('span','field-note',tr(greek===3?'greekOnly':greek?'mixedSites':'worldOnly')));
  }
  byId('telemetry-time').textContent = reserved?.start_utc ?? '';
  const wave = routes.find(row => row.key === waveKey);
  byId('wave-caption').textContent = wave ? tr('waveFor') + ' · ' + wave.key.split('~').at(-1) : tr('noWave');
  drawWave(wave);
  telemetry.closest('aside').classList.toggle('active', (active && stage === 0) || Boolean(wave));
  byId('fingerprint').textContent = seismic?.input_sha256 ? 'SHA‑256 · ' + seismic.input_sha256 : '';
  byId('routes').replaceChildren(...routes.map(row => {
    const [provider, protocol, code] = row.key.split('~');
    const entry = element('li');
    entry.append(element('strong', 'mono', code), ' · ' + provider + ' · ' + protocol,
      element('div', '', routeLabel(row.status?.state) + (row.values_in_window ? ' · n=' + row.values_in_window : '')));
    if (row.arrival_ms !== undefined) entry.append(element('div', 'mono', 'UTC ' + new Date(row.arrival_ms).toISOString().slice(11)));
    if (seismic?.used.includes(row.key)) entry.append(element('div', 'label', '✓ ' + tr('selectedSites')));
    return entry;
  }));
}

function setStage(index, label, view) {
  stage = index;
  currentStatus = label;
  arrangement = view;
  renderStage();
  renderCards();
}

function renderFinishedReading() {
  const reading = byId('reading');
  reading.hidden = active || proof?.reading.state !== 'RESULT';
  if (reading.hidden) return;
  const narrative = proof.narrative ? [narrativePanel(proof.narrative, context.knowledge, context.hcke)] : [];
  reading.replaceChildren(...narrative, renderReading(proof.reading, context.rules, index => {
    stop = index;
    renderCards();
  }, stop));
}

function wait(ms, signal) {
  if (signal.aborted) return Promise.resolve();
  return new Promise(resolve => {
    const done = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal.addEventListener('abort', done, {once: true});
  });
}

async function reveal(signal) {
  const reading = proof.reading;
  if (reading.state !== 'RESULT') {
    setStage(0, reading.state === 'NO_FIGURE' ? 'noFigure' : 'noData', 'waiting');
    return;
  }
  const fan = reading.attempts.at(-1).fan;
  if (!signal.aborted) {
    for (const attempt of reading.attempts.slice(0, -1)) {
      if (signal.aborted) break;
      shownFan = attempt.fan;
      counter = String(attempt.index + 1);
      setStage(3, 'retry', 'dealing');
      await wait(760, signal);
    }
    shownFan = [];
    counter = '';
    setStage(1, 'shuffling', 'shuffle');
    await wait(730, signal);
    setStage(2, 'cutting', 'cut');
    await wait(660, signal);
    shownFan = fan;
    setStage(3, 'dealing', 'dealing');
    await wait(870, signal);
    for (stop = 0; stop < 7 && !signal.aborted; stop++) {
      setStage(4, 'counting', 'spread');
      await wait(430, signal);
    }
    stop = -1;
    shownFan = [];
    setStage(5, 'shuffle12', 'shuffle');
    await wait(640, signal);
    setStage(5, 'cut12', 'cut');
    await wait(620, signal);
    shownFan = reading.packs.flatMap(pack => pack.cards);
    setStage(5, 'packetStatus', 'pack-deal');
    await wait(750, signal);
  }
  shownFan = fan;
  stop = 0;
  setStage(6, 'ready', 'spread');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!context || active || !FIGURES.includes(figure.value)) return;
  const preferred = figure.value;
  const topic = theme.value;
  store('figure', preferred);
  active = true;
  proof = null;
  routes = [];
  shownFan = [];
  waveKey = null;
  stop = -1;
  animation = new AbortController();
  if (reduceMotion) animation.abort();
  const anchor = performance.now();
  reserved = reserveRound(Date.now(), Number(byId('duration').value), Number(byId('round-seconds').value), context);
  deadline = anchor + reserved.spin_seconds * 1000;
  renderForm();
  renderFinishedReading();
  renderTelemetry();
  setStage(0, 'collecting', 'waiting');
  byId('round-status').focus({preventScroll: true});
  byId('table').scrollIntoView({behavior: reduceMotion ? 'instant' : 'smooth'});
  const tick = () => {
    const remaining = Math.max(0, deadline - performance.now());
    counter = Math.ceil(remaining / 1000) + ' s';
    byId('stage-counter').textContent = counter;
    if (remaining <= 2000 && currentStatus === 'collecting') {
      currentStatus = 'sealed';
      renderStage();
    }
  };
  tick();
  const timer = setInterval(tick, 200);
  let issue = false;
  try {
    let seismic;
    try {
      seismic = await SeismoLive.evaluate(reserved, context.stations, rows => {
        routes = rows;
        waveKey = rows.find(row => row.complete && row.wave)?.key ??
          rows.find(row => row.wave)?.key ?? null;
        renderTelemetry();
      }, anchor);
    } catch (error) {
      console.error(error);
      seismic = {round: {...reserved, state: 'NO RESULT', used: [], routes: [], reason: 'collector-error'}, records: {}};
      issue = true;
    }
    seismic.stations_txt = context.catalogText;
    proof = await sealRound(seismic, preferred, context, topic);
    await new Promise(resolve => setTimeout(resolve, Math.max(0, deadline - performance.now())));
    clearInterval(timer);
    counter = '';
    await reveal(animation.signal);
    if (issue) setStage(0, 'operationError', 'waiting');
  } catch (error) {
    console.error(error);
    proof = null;
    setStage(0, 'operationError', 'waiting');
  } finally {
    clearInterval(timer);
    counter = '';
    active = false;
    renderForm();
    renderStage();
    renderTelemetry();
    renderFinishedReading();
  }
});

theme.addEventListener('change', () => store('theme', theme.value));

figure.addEventListener('change', () => {
  if (FIGURES.includes(figure.value)) store('figure', figure.value);
  renderStage();
});

byId('save-proof').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(proof, null, 2) + '\n'], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = element('a');
  a.href = url;
  a.download = proof.seismic.round.id + '.json';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
});

byId('motion').addEventListener('click', () => {
  reduceMotion = !reduceMotion;
  store('reduced-motion', String(reduceMotion));
  if (reduceMotion) animation?.abort();
  renderStage();
});

reducedPref.addEventListener('change', event => {
  reduceMotion = event.matches || stored('reduced-motion') === 'true';
  if (reduceMotion) animation?.abort();
  renderStage();
});

localize(() => {
  renderCredits(context?.knowledge);
  renderForm();
  renderStage();
  renderCards();
  renderTelemetry();
  renderFinishedReading();
});

try {
  if (!globalThis.crypto?.subtle) bootError = 'crypto';
  else {
    context = await loadContext();
    if (!context.hcke) throw Error('HCKE unavailable');
  }
} catch (error) {
  console.error(error);
  context = undefined;
  bootError = 'resources';
}
renderForm();
renderTelemetry();

renderCredits(context?.knowledge);
