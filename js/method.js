/** The Thesavros 770 reading and the approved digital conventions. */
export const DECK = Object.freeze(['D', 'H', 'S', 'C'].flatMap(suit =>
  ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map(rank => rank + suit)
));
export const FIGURES = Object.freeze(DECK.filter(id => /^[JQK]/.test(id)));
export const TOPICS = Object.freeze(['personal', 'family', 'future', 'unexpected']);
export const METHOD_VERSION = 'SEISMO-CARDS-v1';
export const RULE_VERSION = 'thesavros-770-method-7.v1';
export const MAX_ATTEMPTS = 16;
const encoder = new TextEncoder();
export const rankOf = card => card.slice(0, -1);

function randomStream(key, operation, attempt) {
  const prefix = encoder.encode(METHOD_VERSION + '\0' + operation + '\0');
  const message = new Uint8Array(prefix.length + 8);
  message.set(prefix);
  const fields = new DataView(message.buffer);
  fields.setUint32(prefix.length, attempt);
  let words, index = 8, block = 0;

  return async function indexBelow(range) {
    if (!Number.isSafeInteger(range) || range < 1 || range > 2 ** 32) throw new RangeError('range');
    const limit = Math.floor(2 ** 32 / range) * range;
    for (;;) {
      if (index === 8) {
        if (block === 2 ** 32) throw new RangeError('counter');
        fields.setUint32(prefix.length + 4, block++);
        words = new DataView(await crypto.subtle.sign('HMAC', key, message));
        index = 0;
      }
      const word = words.getUint32(4 * index++);
      if (word < limit) return word % range;
    }
  };
}

async function shuffleAndCut(cards, key, attempt) {
  const deck = cards.slice();
  const indexBelow = randomStream(key, 'shuffle' + deck.length, attempt);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = await indexBelow(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const cutIndex = randomStream(key, 'cut' + deck.length, attempt);
  const cut = 1 + await cutIndex(deck.length - 1);
  return {cut, deck: deck.slice(cut).concat(deck.slice(0, cut))};
}

export function dealFan(cards) {
  const deck = cards.slice();
  const fan = [];
  for (let i = 0; i < 12; i++) {
    deck.push(...deck.splice(0, 6));
    fan.unshift(deck.shift());
  }
  return fan;
}

export function chooseFigure(fan, preferred) {
  return [preferred, '7H', '7C'].find(card => fan.includes(card)) ?? null;
}

export function readFan(fan, figure, rules) {
  const matches = (card, pattern) => pattern.endsWith('*')
    ? rankOf(card) === pattern.slice(0, -1)
    : card === pattern;
  const multiples = [];
  for (const rank of ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A']) {
    const cards = fan.filter(card => rankOf(card) === rank);
    if (cards.length > 1) multiples.push({rank, count: cards.length, cards});
  }

  let start = fan.indexOf(figure);
  if (fan.length !== 12 || start < 0) throw new RangeError('fan');
  const steps = [];
  for (let i = 0; i < 7; i++) {
    const target = (start + 6) % fan.length;
    const card = fan[target];
    const left = fan[(target + fan.length - 1) % fan.length];
    const right = fan[(target + 1) % fan.length];
    const withNeighbor = neighbor => rules.pairs.filter(({match: [a, b]}) =>
      (matches(card, a) && matches(neighbor, b)) ||
      (matches(card, b) && matches(neighbor, a))
    ).map(rule => rule.id);
    const modifier = [left, right].includes('AC') && card !== 'AC' ? [card]
      : card === 'AC' ? [left, right] : [];
    steps.push({start, target, card, left, right, leftRules: withNeighbor(left),
      rightRules: withNeighbor(right), modifier, returnsToFigure: card === figure});
    start = (target + 1) % fan.length;
  }
  return {multiples, steps};
}

export async function readCards(fingerprint, preferred, rules) {
  if (!FIGURES.includes(preferred) || !/^[0-9a-f]{64}$/.test(fingerprint)) throw new Error('inputs');
  const seed = Uint8Array.from(fingerprint.match(/../g), hex => Number.parseInt(hex, 16));
  const key = await crypto.subtle.importKey('raw', seed, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);

  const attempts = [];
  for (let index = 0; index < MAX_ATTEMPTS; index++) {
    const first = await shuffleAndCut(DECK, key, index);
    const fan = dealFan(first.deck);
    const figure = chooseFigure(fan, preferred);
    attempts.push({index, cut52: first.cut, fan, figure});
    if (!figure) continue;
    const second = await shuffleAndCut(fan, key, index);
    return {
      state: 'RESULT', preferred, figure, attempts, cut12: second.cut,
      ...readFan(fan, figure, rules),
      packs: TOPICS.map((topic, i) => ({topic, cards: second.deck.slice(3 * i, 3 * i + 3)}))
    };
  }
  return {state: 'NO_FIGURE', preferred, attempts};
}

export function validateRules(rules) {
  const validEntry = rule => rule && [26, 27].includes(rule.page) &&
    ['el', 'en'].every(lang => typeof rule[lang] === 'string' && rule[lang].trim());
  const ranks = new Set(DECK.map(rankOf));
  if (rules.version !== RULE_VERSION || Object.keys(rules.cards).length !== DECK.length ||
    !DECK.every(card => validEntry(rules.cards[card])) || rules.pairs.length !== 72 ||
    !rules.pairs.every((rule, i) => validEntry(rule) && rule.id === 'P' + String(i + 1).padStart(2, '0') &&
      rule.match.length === 2 && rule.match.every(pattern => DECK.includes(pattern) || ['K*', 'Q*'].includes(pattern))) ||
    Object.keys(rules.multiples).length !== ranks.size ||
    ![...ranks].every(rank => rules.multiples[rank] && [2, 3, 4].every(n => validEntry(rules.multiples[rank][n])))) {
    throw new Error('rules');
  }
  return rules;
}
