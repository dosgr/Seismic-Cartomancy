/** Build one language-neutral reading plan, then realize it in Greek or English. */
export const NARRATOR_VERSION = 'seismo-nlg.v1';
const TOPICS = {
  love: ['Ο έρωτας και οι δεσμοί σου', 'Love and your closest bonds', 'ο έρωτας', 'love'],
  work: ['Τα σχέδια και η δουλειά σου', 'Your work and plans', 'η δουλειά και τα σχέδιά σου', 'your work and plans'],
  money: ['Τα οικονομικά σου', 'Your finances', 'τα οικονομικά σου', 'your finances'],
  family: ['Το σπίτι και η οικογένειά σου', 'Home and family', 'η οικογένειά σου', 'your family'],
  social: ['Οι άνθρωποι γύρω σου', 'The people around you', 'ο περίγυρός σου', 'the people around you'],
  inner: ['Όσα σε απασχολούν', 'What is on your mind', 'όσα σε απασχολούν', 'what is on your mind'],
  obstacles: ['Οι δυσκολίες στο άνοιγμά σου', 'The challenges in your spread', 'οι δυσκολίες', 'the challenges'],
  change: ['Αλλαγές και προοπτικές', 'Changes and possibilities', 'οι αλλαγές', 'change'],
  support: ['Η στήριξη που διακρίνεται', 'The support in your spread', 'η στήριξη', 'support']
};
const REPEATED_SIGNALS = {
  'K:2':'delay','9D':'delay',P09:'delay',
  '6:2':'disappointment','A:2':'disappointment','4S':'disappointment',
  '7C':'gains','6:3':'gains',P63:'gains','9:2':'gains',
  '3:2':'calm','2:2':'calm','2:3':'calm',
  'JD':'news',P37:'news','AD':'news',
  '5H':'reconcile',P11:'reconcile',P52:'reconcile',P67:'reconcile',
  '4D':'helpful-friends',P68:'helpful-friends',
  P40:'recklessness',P41:'recklessness','4:3':'recklessness','6D':'recklessness',
  P38:'legal-gain',P15:'legal-gain','9C':'legal-gain'
};
const PACKS = {
  personal: ['Το προσωπικό σου πακέτο', 'For you personally'],
  family: ['Το πακέτο του σπιτιού σου', 'For your home and family'],
  future: ['Όσα διαφαίνονται στη συνέχεια', 'What comes into view next'],
  unexpected: ['Εκεί όπου χωρά το απρόοπτο', 'Where the unexpected enters']
};
const INTRO = [
  ['Από τα χαρτιά που έπεσαν για σένα, πρώτο θέμα είναι {theme}.', 'Of the cards laid out for you, the strongest theme is {theme}.'],
  ['Το άνοιγμά σου έχει ένα καθαρό κέντρο βάρους. Εκεί ξεχωρίζει {theme}.', 'Your spread has a clear centre of gravity. Here, the cards return to {theme}.'],
  ['Αν ακολουθήσεις τη σειρά των χαρτιών σου, το θέμα που παίρνει το μεγαλύτερο βάρος είναι {theme}.', 'Follow the cards through your spread and one theme carries more weight than the others: {theme}.'],
  ['Το πρώτο νήμα στην ανάγνωσή σου είναι {theme}.', 'The first thread running through your reading is {theme}.']
];
const MIXED = [
  ['Δίπλα σε αυτή την ένδειξη, τα φύλλα σου αφήνουν χώρο και για μια διαφορετική ανάγνωση.', 'Alongside that indication, your cards leave room for a different reading.'],
  ['Εδώ συναντιούνται δύο διαφορετικοί τόνοι. Ο πιο δύσκολος αξίζει να ακουστεί μαζί με τον ευνοϊκό.', 'Two different notes meet here. The difficult one belongs in the reading alongside the hopeful one.'],
  ['Το ίδιο θέμα φαίνεται κι από άλλη πλευρά στις ενδείξεις σου.', 'Another side of the same theme comes through in the reading.']
];
const LINKS = [
  ['Στην ίδια γραμμή,', 'In the same part of the reading,'],
  ['Στο πλάι της πρώτης ένδειξης,', 'Alongside the first clue,'],
  ['Στο ίδιο σημείο,', 'At the same point,'],
  ['Στο ίδιο θέμα υπάρχει κι άλλη όψη.', 'There is another facet to the same theme.']
];
const WRAP = {
  mixed: [
    ['Κράτησε μαζί τη δυνατότητα που ανοίγεται και τη δυσκολία που τη συνοδεύει. Και οι δύο έχουν θέση στο δικό σου άνοιγμα.', 'Hold on to both the possibility that opens up and the difficulty beside it. Both belong in your spread.'],
    ['Αν μείνεις με μία εικόνα από τα χαρτιά σου, άφησέ τη να χωρά και όσα σε ενθαρρύνουν και όσα σε προβληματίζουν.', 'If you take one image from your cards, let it make room for what encourages you as well as what gives you pause.']
  ],
  plus: [
    ['Μείνε λίγο στις ευνοϊκές ενδείξεις που επανέρχονται στο άνοιγμά σου. Αυτές σχηματίζουν τον πιο αισιόδοξο τόνο του.', 'Stay a moment with the favourable clues that return in your spread. They give it its most hopeful tone.'],
    ['Στο κλείσιμο, οι ευνοϊκές ενδείξεις παίρνουν περισσότερο χώρο στα δικά σου χαρτιά.', 'As your reading closes, the favourable indications have more room in your cards.']
  ],
  minus: [
    ['Τα χαρτιά σου δίνουν περισσότερο χώρο στις δυσκολίες. Μπορείς να διαβάσεις αυτόν τον τόνο ως αφορμή να σκεφτείς όσα σε απασχολούν.', 'Your cards give more room to the difficulties. You can take that tone as a moment to reflect on what concerns you.'],
    ['Ο πιο βαρύς τόνος του ανοίγματος προκύπτει από τις ενδείξεις που μόλις διάβασες.', 'The heavier tone in your spread comes from the indications you have just read.']
  ],
  neutral: [
    ['Άφησε τα θέματα του ανοίγματός σου να σταθούν πλάι πλάι. Η σειρά των χαρτιών δίνει το νήμα που τα ενώνει.', 'Let the themes in your spread stand side by side. The order of the cards is the thread connecting them.']
  ]
};

const localeIndex = lang => lang === 'en' ? 1 : 0;
const lex = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const tidy = text => text.replace(/\s+/g, ' ').trim().replace(/[.!?]$/, '');
const lower = text => text.charAt(0).toLowerCase() + text.slice(1);
const ended = text => /[.!?]$/.test(text) ? text : text + '.';
function variant(options, key) {
  let score = 2166136261;
  for (const ch of key) score = Math.imul(score ^ ch.codePointAt(0), 16777619);
  return options[(score >>> 0) % options.length];
}

export function makePlan(reading, knowledge) {
  const found = new Map();
  const add = (id, type, cards, tag, where) => {
    const old = found.get(id);
    if (old) {
      if (!old.where.includes(where)) old.where.push(where);
      return;
    }
    found.set(id, {id,type,cards,topic:tag[0],tone:tag[1],where:[where]});
  };
  const card = (id, where) => add(id, 'card', [id], knowledge.cards[id], where);
  reading.steps.forEach((step, i) => {
    const label = 'stop:' + (i + 1);
    card(step.card, label);
    for (const [neighbor, matches] of [[step.left,step.leftRules],[step.right,step.rightRules]]) {
      for (const id of matches) add(id, 'pair', [step.card,neighbor], knowledge.pairs[id], label);
    }
    if (step.modifier.length) add('ace-clubs', 'modifier', ['AC', ...step.modifier.filter(c => c !== 'AC')],
      ['support','~'], label);
  });
  reading.multiples.forEach(item => add(item.rank + ':' + item.count, 'multiple', item.cards,
    knowledge.multiples[item.rank][item.count - 2], 'fan'));
  for (const pack of reading.packs) for (const id of pack.cards) card(id, pack.topic);
  const all = [...found.values()];
  const weight = {pair: 5, multiple: 4, modifier: 2, card: 2};
  const strength = item => weight[item.type] + Math.min(item.where.length - 1, 2);
  const topics = Object.keys(TOPICS).map(id => {
    const items = all.filter(item => item.topic === id).sort((a,b) => strength(b)-strength(a));
    return {id, items, score: items.reduce((sum, item) => sum + strength(item), 0)};
  }).filter(topic => topic.score).sort((a,b) => b.score - a.score || lex(a.id,b.id));
  const principal = topics.slice(0, topics.length > 6 ? 5 : 4);
  const used = new Set();
  const usedMotifs = new Set();
  const motif = item => REPEATED_SIGNALS[item.id] ?? item.id;
  const remember = item => { used.add(item.id); usedMotifs.add(motif(item)); };
  const sections = principal.map(topic => {
    const first = topic.items.find(item=>!usedMotifs.has(motif(item))) ?? topic.items[0];
    const others = topic.items.filter(item=>motif(item)!==motif(first) && !usedMotifs.has(motif(item)));
    const opposite = others.find(item => item.tone !== '~' && first.tone !== '~' && item.tone !== first.tone);
    const duplicate = others.find(item => item.id !== first.id && item.type === 'pair' &&
      first.type === 'pair' && item.cards.every(card => first.cards.includes(card)));
    const second = opposite || duplicate || others[0];
    const ids = second ? [first.id, second.id] : [first.id];
    [first, second].filter(Boolean).forEach(remember);
    return {topic:topic.id, ids, contrast:Boolean(opposite)};
  });
  const packets = reading.packs.map(pack => {
    const inPack = pack.cards.map(id => found.get(id));
    const fresh = inPack.filter(item => !used.has(item.id) && !usedMotifs.has(motif(item)));
    const items = fresh.length ? fresh : inPack;
    const first = items[0];
    const opposite = items.find(item => item.tone !== '~' && first.tone !== '~' && item.tone !== first.tone);
    const second = opposite || (items.length === 3 ? items[1] : undefined);
    return {topic:pack.topic, ids:second ? [first.id,second.id] : [first.id], contrast:Boolean(opposite), echo:fresh.length === 0};
  });
  const fan = reading.attempts.at(-1).fan;
  const comparable = new Set(all.flatMap(item => item.cards));
  const comparative = knowledge.comparative.filter(row => row.cards.every(id => comparable.has(id)) &&
    (row.cards.length === 1 || row.cards.some(id => {
      const index = fan.indexOf(id);
      return index >= 0 && [fan[(index+1)%fan.length],fan[(index+fan.length-1)%fan.length]]
        .includes(row.cards.find(other => other !== id));
    }))).map(row => row.id);
  const tones = new Set(all.map(item => item.tone));
  return {theme:topics[0].id, sections, packets, comparative, all,
    ending:tones.has('+') && tones.has('-') ? 'mixed' : tones.has('+') ? 'plus' : tones.has('-') ? 'minus' : 'neutral'};
}

export function produceNarrative(reading, context, fingerprint) {
  const knowledge = context.knowledge;
  const rules = context.rules;
  const plan = makePlan(reading, knowledge);
  const signals = new Map(plan.all.map(item => [item.id,item]));
  const pairs = new Map(rules.pairs.map(rule => [rule.id,rule]));
  const variants = (table, key) => variant(table, fingerprint + '/' + key);
  const localized = lang => {
    const li = localeIndex(lang);
    const sectionTitle = TOPICS[plan.theme][li+2];
    const frames = [
      ['Στα χαρτιά σου διακρίνεται το εξής μοτίβο: ', 'This is the pattern that appears for you: '],
      ['Η ιστορική ανάγνωση φέρνει μπροστά σου αυτή την εικόνα: ', 'The historical reading brings this into view for you: '],
      ['Εδώ ξεχωρίζει μια συγκεκριμένη ένδειξη: ', 'One particular sign stands out here: '],
      ['Τα δικά σου φύλλα φέρνουν στο φως αυτή την εικόνα: ', 'Your cards bring this image to light: ']
    ];
    let previousFrame;
    const phrase = (id, contextual = false) => {
      const item = signals.get(id);
      if (item.type === 'card' && variants([true,true,true,false], 'form:' + id)) {
        return tidy(knowledge.cards[id][li+2]);
      }
      if (item.type === 'modifier') return li
        ? 'The Ace of Clubs beside another card softens the adverse note in the historical reading'
        : 'Ο Άσος σπαθί πλάι σε άλλο φύλλο μετριάζει τον δυσμενή τόνο της ιστορικής ανάγνωσης';
      const [rank,count] = id.split(':');
      const rule = item.type === 'card' ? rules.cards[id] : item.type === 'pair' ? pairs.get(id) : rules.multiples[rank][count];
      const frame = variants(frames.filter(item => item !== previousFrame),id);
      previousFrame = frame;
      const wording = li ? rule.en : rule.el.replace(/(που |θα )σας /gi, '$1σε ')
        .replace(/σας εκθέτουν/g,'σε εκθέτουν').replace(/σας κυνηγά/g,'σε κυνηγά');
      if (contextual) {
        return (li ? 'a related historical clue is ' : 'μια άλλη ιστορική ένδειξη είναι ') + lower(tidy(wording));
      }
      return frame[li] + lower(tidy(wording));
    };
    const write = (section, packet) => {
      const [a,b] = section.ids;
      if (packet && section.echo) {
        const theme = TOPICS[signals.get(a).topic][li+2];
        return {heading:PACKS[section.topic][li], text:(li
          ? 'This packet returns to a thread you have already seen: '
          : 'Το πακέτο αυτό ξαναπιάνει ένα νήμα που είδες ήδη στην αφήγηση: ') + theme + '.'};
      }
      let text = ended(phrase(a));
      if (b) {
        const link = variants(section.contrast ? MIXED : LINKS, 'link:' + a + ':' + b)[li];
        text += ' ' + link + ' ' + ended(link.endsWith(',') ? lower(phrase(b,true)) : phrase(b));
      }
      return {heading:(packet ? PACKS : TOPICS)[section.topic][li], text};
    };
    const second = plan.sections[1];
    const follow = second && second.ids.length > 1
      ? (li ? ' A second thread worth following is ' : ' Στη συνέχεια της ανάγνωσης ξεχωρίζει επίσης το εξής θέμα: ') + TOPICS[second.topic][li+2] + '.'
      : '';
    return {
      introduction:variants(INTRO,plan.theme)[li].replace('{theme}',sectionTitle) + follow,
      sections:plan.sections.map(s => write(s,false)),
      packets:plan.packets.map(s => write(s,true)),
      conclusion:variants(WRAP[plan.ending],'closing:' + plan.ending)[li]
    };
  };
  return {engine:NARRATOR_VERSION, knowledge:knowledge.version, knowledge_sha256:context.knowledgeHash,
    plan:{theme:plan.theme, sections:plan.sections, packets:plan.packets, comparative:plan.comparative,
      signals:plan.all}, el:localized('el'), en:localized('en')};
}

export function validateKnowledge(data, rules) {
  const tagged = entry => Array.isArray(entry) && Object.hasOwn(TOPICS,entry[0]) && ['+','-','~'].includes(entry[1]);
  const exact = (entries, keys) => entries && Object.keys(entries).length === keys.length;
  const ids = Object.keys(rules.cards);
  if (!data.version || !exact(data.cards,ids) || !ids.every(id => tagged(data.cards[id]) &&
    [2,3].every(i => typeof data.cards[id][i] === 'string' && data.cards[id][i].trim())) ||
    !exact(data.pairs,rules.pairs) || !rules.pairs.every(({id}) => tagged(data.pairs[id])) ||
    !Object.keys(rules.multiples).every(rank => data.multiples[rank]?.length === 3 && data.multiples[rank].every(tagged)) ||
    !Array.isArray(data.comparative) || !data.comparative.every(row => Object.hasOwn(data.sources,row.source) &&
      row.cards.length >= 1 && row.cards.length <= 2 && row.cards.every(id => ids.includes(id)) && row.el && row.en) ||
    new Set(data.comparative.map(r => r.id)).size !== data.comparative.length) throw new Error('knowledge');
  return data;
}
