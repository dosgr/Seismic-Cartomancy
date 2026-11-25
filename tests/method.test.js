import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DECK, FIGURES, TOPICS, rankOf, chooseFigure, dealFan, readCards, readFan} from '../js/method.js';
import {context, fixture, replayRecordedRound} from './helpers.js';
const {rules} = context;
const printFan = ['3D','10S','8D','KS','JD','QC','9C','KD','JH','AS','7H','9H'];

test('printed 1953 fan preserves the seven starts, targets, neighbours and return', () => {
  const {steps, multiples} = readFan(printFan, 'QC', rules);
  assert.deepEqual(steps.map(step => step.start), [5,0,7,2,9,4,11]);
  assert.deepEqual(steps.map(step => step.target), [11,6,1,8,3,10,5]);
  assert.deepEqual(steps.map(step => step.card), ['9H','9C','10S','JH','KS','7H','QC']);
  assert.deepEqual(steps.map(step => [step.left,step.right]),
    [['7H','3D'],['QC','KD'],['3D','8D'],['KD','AS'],['8D','JD'],['AS','9H'],['JD','9C']]);
  assert.deepEqual(steps.map(step => step.returnsToFigure), [false,false,false,false,false,false,true]);
  assert.deepEqual(multiples.map(item => item.rank), ['K','J','9']);
  assert.equal(steps[6].rightRules.includes('P56'), true);
});

test('the complete deterministic deck deals to the left and never duplicates an identity', () => {
  assert.equal(new Set(DECK).size, 52);
  assert.equal(FIGURES.length, 12);
  assert.equal(Object.keys(rules.cards).length, 52);
  const fan = dealFan(DECK);
  assert.deepEqual(fan, ['JS','3S','7H','QD','4D','10C','3C','9S','2S','8H','AH','7D']);
  assert.equal(new Set(fan).size, 12);
  assert.equal(fan.at(-1), '7D');
  assert.equal(fan.at(-2), 'AH');
  assert.deepEqual([...DECK.slice(0,4)], ['AD','2D','3D','4D']);
});

test('prefers the locked figure, then 7H, then 7C, then returns null', () => {
  assert.equal(chooseFigure(['QC','7C','7H'], 'QC'), 'QC');
  assert.equal(chooseFigure(['7C','7H'], 'QC'), '7H');
  assert.equal(chooseFigure(['7C'], 'QC'), '7C');
  assert.equal(chooseFigure(['AC'], 'QC'), null);
});

test('every one of the 72 sourced pairs matches from either side and is bilingual', () => {
  const toCard = pattern => pattern.endsWith('*') ? pattern[0] + 'H' : pattern;
  assert.equal(rules.pairs.length, 72);
  assert.equal(new Set(rules.pairs.map(rule => rule.match.slice().sort().join(','))).size, 71);
  for (const rule of rules.pairs) {
    const [a,b] = rule.match.map(toCard);
    const fan = DECK.filter(card => card !== a && card !== b).slice(0,10);
    fan.splice(6,0,a,b);
    assert.ok(readFan(fan, fan[0], rules).steps[0].rightRules.includes(rule.id), rule.id);
    [fan[6],fan[7]] = [fan[7],fan[6]];
    assert.ok(readFan(fan, fan[0], rules).steps[0].rightRules.includes(rule.id), rule.id);
    assert.ok(rule.el && rule.en && [26,27].includes(rule.page));
  }
  const fan = ['3D','10S','8D','KS','JD','QC','QH','AH','JH','AS','7H','9H'];
  assert.deepEqual(readFan(fan, fan[0], rules).steps[0].rightRules, ['P24','P37']);
  assert.deepEqual(rules.pairs[2].match, ['QD','AS']);
  assert.match(rules.pairs[2].en, /child/);
  assert.match(rules.pairs.find(rule => rule.match.join(',') === '4C,QH').en, /friendships/);
});

test('all 39 equal-rank rules use the exact count even for non-adjacent cards', () => {
  let checked = 0;
  for (const [rank, counts] of Object.entries(rules.multiples)) {
    for (const [countText, entry] of Object.entries(counts)) {
      const count = Number(countText);
      const matching = DECK.filter(card => rankOf(card) === rank).slice(0,count);
      const fan = DECK.filter(card => rankOf(card) !== rank).slice(0,12-count);
      matching.forEach((card,i) => fan.splice(i*3,0,card));
      const {multiples} = readFan(fan, fan[0], rules);
      assert.deepEqual(multiples.filter(item => item.rank === rank), [{rank,count,cards:matching}]);
      assert.ok(entry.el && entry.en);
      checked++;
    }
  }
  assert.equal(checked,39);
});

test('real archive: compatible P3 result and reproducible P4 cards, attempts and packs', async () => {
  const {bundle, used, complete} = await replayRecordedRound();
  const previous = await SeismoProof.compute(fixture.start_ms, fixture.duration, used, used.map(s => complete.get(s.key)), 'SEISMO-P3');
  assert.equal(previous.number, 34);
  assert.equal(previous.input_sha256, fixture.input_sha256);
  const {reading, seismic} = bundle;
  assert.equal(seismic.round.input_sha256, 'cce8c53c130554a44004c5850fa12b3d632df03e54151bc599b27651d9992c30');
  assert.deepEqual(reading.attempts[0].fan, ['6S','4S','7H','6D','3C','AD','JC','KS','9S','2D','10H','AC']);
  assert.equal(reading.cut12, 4);
  assert.deepEqual(reading, await readCards(seismic.round.input_sha256, 'QC', rules));
  assert.equal(reading.state, 'RESULT');
  assert.notDeepEqual(await readCards('b'.repeat(64), 'QC', rules), reading);
  assert.equal(new Set(reading.packs.flatMap(pack => pack.cards)).size, 12);
  assert.deepEqual(reading.packs.map(pack => pack.topic), TOPICS);
  assert.deepEqual([...reading.packs.flatMap(pack => pack.cards)].sort(), [...reading.attempts.at(-1).fan].sort());
  assert.ok(reading.cut12 >= 1 && reading.cut12 <= 11);
  assert.ok(reading.attempts.every(attempt => attempt.cut52 >= 1 && attempt.cut52 <= 51));
});

test('a rejected fan is recorded and the next deterministic attempt chooses 7C', async () => {
  const result = await readCards('0'.repeat(64), 'QC', rules);
  assert.equal(result.attempts.length, 2);
  assert.equal(result.attempts[0].figure, null);
  assert.equal(result.attempts[1].figure, '7C');
  assert.equal(result.attempts[0].cut52, 21);
  assert.equal(result.attempts[1].cut52, 13);
  assert.equal(result.figure, '7C');
});

test('Ace of Clubs annotates neighbours without replacing their basic meanings', () => {
  const fan = ['3D','10S','8D','KS','JD','QC','AC','KD','JH','AS','7H','9H'];
  assert.deepEqual(readFan(fan, fan[0], rules).steps[0].modifier, ['QC','KD']);
  assert.deepEqual(readFan(fan, fan[11], rules).steps[0].modifier, ['QC']);
  assert.equal(rules.cards.QC.page, 26);
});
