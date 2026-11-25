import {cardName, shortCard, currentLanguage, tr, sourcePage, element} from './strings.js';

export function cardFace(card, {index, animation = '', highlight = ''} = {}) {
  const style = ['card', card ? 'card-front' : 'card-back', animation, highlight].filter(Boolean).join(' ');
  const box = element('span', style);
  if (index !== undefined) {
    box.style.setProperty('--i', index);
    box.style.setProperty('--shift', (index % 2 ? 1 : -1) * (13 + index % 4 * 4) + 'px');
    box.style.setProperty('--tilt', (index % 2 ? 6 : -6) + 'deg');
  }
  if (!card) {
    box.setAttribute('aria-hidden', 'true');
    return box;
  }
  const image = element('img');
  image.src = new URL('../assets/cards/' + card + '.webp', import.meta.url);
  image.width = 292;
  image.height = 410;
  image.alt = cardName(card);
  box.append(image);
  return box;
}

export function ruleLine(rule, tokens = [], tag = 'p') {
  const line = element(tag);
  if (tokens.length) {
    line.append(element('strong', '', tokens.map(shortCard).join(' + ')), ' · ');
  }
  line.append(rule[currentLanguage()], sourcePage(rule.page));
  return line;
}

export function renderReading(reading, rules, selectStop, selectedStop = -1) {
  const group = element('div');
  const header = element('header', 'reading-header');
  header.append(element('h2', '', tr('readingTitle')), element('p', 'field-note', tr('readingNote')));
  const labels = element('div', 'ribbon');
  labels.append(
    element('span', 'person-tag', tr('figure') + ' · ' + cardName(reading.figure)),
    element('span', 'person-tag', tr('attempts') + ' · ' + reading.attempts.length)
  );
  if (reading.figure !== reading.preferred) {
    labels.append(element('span', 'person-tag', tr('substitute')));
  }
  header.append(labels);
  group.append(header);
  const same = element('section', 'reading-panel');
  same.append(element('h3', '', tr('same')));
  if (reading.multiples.length) {
    const list = element('ul');
    for (const {rank, count, cards} of reading.multiples) {
      list.append(ruleLine(rules.multiples[rank][count], cards, 'li'));
    }
    same.append(list);
  } else {
    same.append(element('p', 'field-note', tr('noneSame')));
  }
  group.append(same);

  const stops = element('section', 'reading-panel');
  stops.append(element('h3', '', tr('stops')));
  const pairsById = new Map(rules.pairs.map(rule => [rule.id, rule]));
  const details = [];
  for (const [index, step] of reading.steps.entries()) {
    const entry = element('details', 'stop-detail');
    entry.open = index === selectedStop;
    const title = tr('stop') + ' ' + (index + 1) + ' · ' + cardName(step.card);
    const summary = element('summary', '', title);
    summary.addEventListener('click', () => {
      if (!entry.open) selectStop(index);
    });
    entry.append(summary);
    entry.append(
      element('p', 'field-note', tr('startAt') + ' · ' + cardName(reading.attempts.at(-1).fan[step.start])),
      element('p', 'field-note', tr('neighbors') + ' · ' + cardName(step.left) + ' / ' + cardName(step.right)),
      ruleLine(rules.cards[step.card], [step.card])
    );
    for (const [neighbor, ids] of [[step.left, step.leftRules], [step.right, step.rightRules]]) {
      for (const id of ids) entry.append(ruleLine(pairsById.get(id), [step.card, neighbor]));
    }
    if (step.modifier.length) {
      const note = element('p', 'inset-note', tr('clubsAce') + ' ' + step.modifier.map(shortCard).join(', '));
      note.append(sourcePage(27));
      entry.append(note);
    }
    if (step.returnsToFigure) {
      const note = element('p', 'field-note', tr('returnFigure'));
      note.append(sourcePage(27));
      entry.append(note);
    }
    details.push(entry);
  }
  stops.append(...details);
  group.append(stops);

  const packets = element('section', 'reading-panel packet-panel');
  packets.append(element('h3', '', tr('packets')));
  const grid = element('div', 'packs');
  for (const {topic, cards} of reading.packs) {
    const pack = element('article', 'pack');
    const title = element('h4', '', tr(topic));
    title.append(sourcePage(27));
    const images = element('div', 'pack-cards');
    images.append(...cards.map(card => cardFace(card)));
    pack.append(title, images);
    for (const card of cards) pack.append(ruleLine(rules.cards[card], [card]));
    grid.append(pack);
  }
  packets.append(grid);
  group.append(packets);
  return group;
}
