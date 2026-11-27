/** Versioned, local interpretation of the approved Thesavros 770 trace. */
export const HCKE_VERSION = 'hcke.2.0.0-beta.1';
export const HCKE_FILES = ['active.json','bilingual-card-voices.json','composition-rules.json','policy.json'];
export const languages = ['el','en'];
const sortId = (a,b) => a < b ? -1 : a > b ? 1 : 0;
const unique = values => [...new Set(values)];
const textPair = (el,en) => ({el,en});
const stageHeadings = {
  personal:textPair('Προσωπικά','Personal matters'), family:textPair('Σπίτι και οικογένεια','Home and family'),
  future:textPair('Όσα ανοίγονται στη συνέχεια','What comes into view next'), unexpected:textPair('Το απρόοπτο','The unexpected')
};
const related = {
  love:['love','relationships','repair'], work:['work','agency','recognition','authority'],
  money:['money','work'], family:['family','home','care'], social:['social','friendship','trust'],
  change:['change','travel','movement','surprise'], obstacles:['obstacles','conflict','worries'],
  support:['support','care'], inner:['inner','hope','worries']
};
const centres = {
  support:textPair('Η στήριξη αποκτά συγκεκριμένο νόημα όταν τη συνδέεις με τη δυσκολία που είναι ήδη ορατή.','Support takes on a concrete meaning when it addresses the difficulty already in view.'),
  mixed:textPair('Οι δύο ενδείξεις συνυπάρχουν. Δες ποια αφορά την ίδια την υπόθεση και ποια το περιβάλλον της.','Both cues have a place here. Consider which concerns the matter itself and which describes the setting around it.'),
  echo:textPair('Το ίδιο θέμα επανέρχεται σε άλλο σημείο του ανοίγματος και δίνει συνέχεια στην εικόνα.','The same theme returns in another part of the spread, giving the reading continuity.'),
  movement:textPair('Η μετακίνηση δίνει το πλαίσιο. Το τι μπορεί να αλλάξει φαίνεται από τις άλλες ενδείξεις που τη συνοδεύουν.','The journey sets the scene. The cues beside it show what might change.'),
  together:textPair('Οι ενδείξεις διαβάζονται μαζί, καθεμία στο δικό της πλαίσιο.','The cues belong together, each within its own scope.')
};
const closings = {
  love:textPair('Κράτησε στη συζήτηση ό,τι δείχνει καθαρά τη σχέση και δώσε δικό τους χώρο στις πρακτικές εκκρεμότητες.','In the conversation, keep sight of what speaks clearly to the relationship and give practical concerns space of their own.'),
  work:textPair('Η εικόνα γίνεται πιο καθαρή όταν ξεχωρίζεις τι μπορείς να προετοιμάσεις από όσα χρειάζονται χρόνο ή βοήθεια.','The picture becomes clearer when you separate what you can prepare from what still needs time or help.'),
  money:textPair('Διάβασε τις οικονομικές ενδείξεις ως διαφορετικά μέρη της κατάστασης. Ένα όφελος και μια δυσκολία μπορούν να συνυπάρχουν.','Read the financial cues as distinct parts of the situation. A gain and a difficulty can be present at the same time.'),
  family:textPair('Ποια πλευρά του σπιτιού ζητά συνεννόηση και ποια έχει ήδη κάποιο στήριγμα; Αυτή η διάκριση δίνει χώρο και στις δύο.','What at home needs a conversation, and what is already supported? That distinction makes room for both.'),
  social:textPair('Σκέψου ποια συμπεριφορά σου δίνει λόγο να εμπιστευτείς κάποιον και ποια σου ζητά να κρατήσεις λίγο χρόνο για σκέψη.','Consider what gives you reason to trust someone and what calls for a little time to think.'),
  change:textPair('Δώσε σημασία στο βήμα που έχει ήδη πάρει μορφή. Οι υπόλοιπες δυνατότητες μπορούν να μείνουν ανοιχτές.','Give weight to the step that has already taken shape. The other possibilities can stay open.'),
  obstacles:textPair('Το εμπόδιο γίνεται πιο κατανοητό όταν το ονομάσεις. Ξεχώρισε τη δυσκολία από τη διαθέσιμη βοήθεια ή το επόμενο βήμα.','An obstacle becomes clearer when you can name it. Distinguish the difficulty from the help available or the next step.'),
  support:textPair('Η βοήθεια παίρνει αξία εκεί όπου συναντά μια ανάγκη που έχει ήδη φανεί. Κράτησε ανοιχτό ποιος ή τι μπορεί να την προσφέρει.','Help matters where it meets a need already in view. Leave open who or what might provide it.'),
  inner:textPair('Άφησε την ανάγνωση να γίνει αφορμή να σκεφτείς τι έχει μεγαλύτερο βάρος για σένα τώρα.','Let the reading prompt you to consider what carries most weight for you now.'),
  general:textPair('Διάβασε το άνοιγμα ως εικόνα για σκέψη. Δώσε χώρο τόσο στις δυνατότητες όσο και στις δυσκολίες που φάνηκαν.','Take the spread as a picture to reflect on, with room for both its possibilities and its difficulties.')
};

export function validateHcke([active, voices, recipes, policy], rules) {
  const expected = [...Object.keys(rules.cards).map(card=>'A-'+card),
    ...rules.pairs.map(pair=>'A-'+pair.id),
    ...Object.keys(rules.multiples).flatMap(rank=>[2,3,4].map(n=>'A-M-'+rank+'-'+n)), 'A-AC-MOD'];
  const indexed = Object.fromEntries(active.historical_triggers.map(row=>[row.id,row]));
  if (active.rules_version !== rules.version || policy.historical_rules !== rules.version ||
      expected.length!==active.historical_triggers.length || !expected.every(key=>Object.hasOwn(indexed,key)) ||
      !active.historical_triggers.every(row=>row.preserve_activation===true) ||
      !active.editorial_refinements.concat(active.optional_editorial_inspiration).every(row=>
        row.historical_trigger_imported===false && row.anchor_ids.length && row.anchor_ids.every(id=>indexed[id])) ||
      new Set(voices.map(v=>v.card)).size!==52 || !voices.every(v=>indexed[v.authority] && languages.every(lang=>v.text[lang] && v.contextual_reading.text[lang] && v.packet_motif[lang])) ||
      recipes.length!==15 || !recipes.every(r=>r.category==='Σ'&&r.historical_trigger===false)) throw Error('knowledge');
  return {active, indexed, voices:Object.fromEntries(voices.map(v=>[v.card,v])), recipes, policy};
}

function tag(knowledge,id) {
  if (id==='A-AC-MOD') return ['support','~'];
  if (id.startsWith('A-P')) return knowledge.pairs[id.slice(2)];
  if (id.startsWith('A-M-')) {
    const [, , rank,count] = id.split('-');
    return knowledge.multiples[rank][Number(count)-2];
  }
  return knowledge.cards[id.slice(2)];
}
const historicalPair = id => 'A-'+id;
const individual = card => 'A-'+card;
const themesMatch = (topic,tags) => related[topic]?.some(t=>tags.includes(t)) ?? false;

export function planHcke(reading, context, topic) {
  const {hcke,knowledge} = context;
  if (!Object.hasOwn(hcke.policy.topics,topic) || reading.state!=='RESULT') throw Error('knowledge');
  const fan = reading.attempts.at(-1).fan;
  const pairEvents = new Map();
  const showable = id => hcke.indexed[id].display_policy!=='source-note-only-or-specific-safe-framing';
  const stops = reading.steps.map((step,index)=>{
    const adjacent = (delta,card,matches) => {
      const position = (step.target+delta+fan.length)%fan.length;
      return matches.map(pair=>{
        const source = historicalPair(pair);
        const positions = [position,step.target].sort((a,b)=>a-b);
        const key = source+'@'+positions.join('.');
        if (!pairEvents.has(key)) pairEvents.set(key,{key,source,positions,stops:[]});
        pairEvents.get(key).stops.push(index+1);
        return {key,source,card};
      });
    };
    const left = adjacent(-1,step.left,step.leftRules);
    const right = adjacent(1,step.right,step.rightRules);
    const mitigated = step.modifier.filter(c=>tag(knowledge,individual(c))[1]==='-');
    const claims = unique([individual(step.card),...left.map(ev=>ev.source),...right.map(ev=>ev.source),
      ...(mitigated.length?['A-AC-MOD']:[])]);
    const neighbours = [individual(step.left),individual(step.card),individual(step.right)];
    return {index:index+1,position:step.target,centre:step.card,neighbours, left,right,mitigated, claims, returns:step.returnsToFigure};
  });
  const multiples = reading.multiples.map(row=>({...row, source:'A-M-'+row.rank+'-'+row.count}));
  const packs = reading.packs.map(row=>({...row,claims:row.cards.map(individual)}));
  const directlyRead = unique([...stops.flatMap(s=>s.claims),...multiples.map(m=>m.source),...packs.flatMap(p=>p.claims)]);
  const focusIds = directlyRead.filter(id=>showable(id)&&themesMatch(topic,[tag(knowledge,id)[0],...(hcke.voices[id.slice(2)]?.topics??[])]));
  const ranked = stops.map(s=>{
    const newlySeen = [...s.left,...s.right].filter(e=>showable(e.source));
    const focus = s.claims.some(c=>focusIds.includes(c));
    return {stop:s, pairs:newlySeen, score:3+newlySeen.length*5+(s.mitigated.length?2:0)+(focus?2:0)};
  }).sort((a,b)=>b.score-a.score || a.stop.index-b.stop.index);
  const strongestMultiple = multiples.filter(m=>showable(m.source)).sort((a,b)=>
    Number(focusIds.includes(b.source))-Number(focusIds.includes(a.source))||b.count-a.count||sortId(a.source,b.source))[0];
  const types = ids => new Set(ids.map(id=>tag(knowledge,id)[1]));
  const sameScene = (ref,scope) => ref.anchor_ids.every(id=>scope.includes(id));
  const candidates = hcke.active.editorial_refinements.concat(hcke.active.optional_editorial_inspiration);
  function nuance(scope,stop) {
    const allowed = candidates.filter(ref=>{
      if (!sameScene(ref,scope) || !ref.anchor_ids.every(id=>directlyRead.includes(id))) return false;
      // The topic cannot manufacture a cue. Explicit optional prerequisites remain conservative.
      const specialised = {
        'N-LAW-008': Boolean(stop?.centre==='AD'),
        'N-FON-008': Boolean(stop?.centre==='AD'),
        'TRI-9D': scope.some(id=>['A-P61','A-7C','A-9C'].includes(id)),
        'N-TH765-021': scope.includes('A-9D'),
        'N-TH766-098': types(scope).has('-') && types(scope).has('+'),
        'N-TH766-100': scope.some(id=>['A-P11','A-P67','A-5H'].includes(id)),
        'N-TH772-036': scope.includes('A-M-10-3'),
        'N-TH769-042': scope.includes('A-M-K-4'),
        'N-TRI-029': scope.some(id=>['A-P11','A-P67','A-5H'].includes(id)),
        'N-TH772-017': scope.includes('A-6H'),
        'N-HAF-001': scope.includes('A-P48'),
        'FOL-2D':scope.some(id=>['A-P26','A-P48','A-P50'].includes(id)),
        'N-HAF-003': scope.includes('A-P48')&&scope.includes('A-2H'),
        'N-LAG-010':false,
        'N-CAS-018':false,
        'N-CAS-030':false,
        'N-LAW-007':scope.includes('A-P61'),
        'N-CAS-046':scope.some(id=>id==='A-M-J-3'||id==='A-P26'),
        'N-CAS-039':false,
        'N-CAS-031':scope.includes('A-KS'),
        'N-AUR-033':scope.includes('A-M-Q-4'),
        'N-MCR-050':scope.some(id=>['A-5C','A-10C','A-AC'].includes(id))
      };
      if (Object.hasOwn(specialised,ref.source_id) && !specialised[ref.source_id]) return false;
      return ref.topic===topic || themesMatch(topic,[ref.topic]) ||
        Boolean(specialised[ref.source_id] && ref.anchor_ids.some(id=>focusIds.includes(id)));
    });
    return allowed.find(ref=>ref.status==='proposed-refinement')?.id ?? allowed[0]?.id ?? null;
  }
  const sections = [];
  const writtenPairs=new Set();
  const recipesFor = (s,ids)=>{
    const leftTones=types(s.left.filter(e=>ids.includes(e.source)).map(e=>e.source));
    const rightTones=types(s.right.filter(e=>ids.includes(e.source)).map(e=>e.source));
    const bothSides=Boolean(leftTones.size&&rightTones.size);
    const opposite=(leftTones.has('-')&&rightTones.has('+'))||(leftTones.has('+')&&rightTones.has('-'));
    return [
      ...(opposite?['S-R01']:[]),
      ...(!bothSides&&ids.some(id=>id.startsWith('A-P'))?['S-R02']:[]),
      ...(ids.includes('A-P24')&&ids.includes('A-P37')?['S-R03']:[]),
      ...(s.mitigated.length?['S-R05']:[]),
      ...(s.centre==='AD'?['S-R06']:[]),
      ...(ids.includes('A-P18')?['S-R07']:[]),
      ...(ids.includes('A-P19')?['S-R11']:[]),
      ...(s.claims.some(id=>!showable(id))?['S-R14']:[]),
      ...(ids.includes('A-P61')?['S-R15']:[])
    ];
  };
  const requested = ranked.filter(item=>item.stop.claims.some(id=>focusIds.includes(id)));
  const special = ranked.find(item=>{
    const ids = item.pairs.map(e=>e.source);
    const recipes=recipesFor(item.stop,ids);
    return recipes.includes('S-R01')||recipes.includes('S-R03');
  });
  const mitigator = ranked.find(item=>item.stop.mitigated.length);
  const choice = unique([special,requested[0],mitigator,...ranked].filter(Boolean)).slice(0,strongestMultiple?2:3);
  for (const {stop:s,pairs} of choice) {
    const selected = pairs.filter(e=>!writtenPairs.has(e.key));
    selected.forEach(e=>writtenPairs.add(e.key));
    const ids = unique([individual(s.centre),...selected.map(e=>e.source),...(s.mitigated.length?['A-AC-MOD']:[])]);
    sections.push({kind:'stop',stop:s.index,ids, left:s.neighbours[0], right:s.neighbours[2],
      mitigation:s.mitigated, recipes:recipesFor(s,ids), nuance:nuance(unique([...s.claims,...s.neighbours]),s)});
  }
  if (strongestMultiple) sections.push({kind:'multiple', ids:[strongestMultiple.source],cards:strongestMultiple.cards,
    recipes:['S-R04',...(directlyRead.includes('A-4S')&&strongestMultiple.source==='A-M-10-3'?['S-R13']:[])],
    nuance:nuance([strongestMultiple.source,...strongestMultiple.cards.map(individual)])});
  const stated = new Set(sections.flatMap(s=>s.ids));
  const packets = packs.map(pack=>{
    const tones=types(pack.claims);
    const echo=pack.claims.some(id=>stated.has(id));
    const links=[...(tones.has('-')&&tones.has('+')?['S-R09']:['S-R08']),...(echo?['S-R10']:[])];
    return {...pack,recipes:links,nuance:nuance(pack.claims)};
  });
  const evidence=sequences=>sequences.map(s=>s.nuance).filter(Boolean);
  return {topic,focused:focusIds.length>0,stops,pairs:[...pairEvents.values()],multiples,packets,sections,directlyRead,
    recipes:unique([...sections,...packets].flatMap(s=>s.recipes).concat(topic!=='general'&&!focusIds.length?['S-R12']:[])),
    nuances:unique([...evidence(sections),...evidence(packets)]),
    witnesses:unique(directlyRead.flatMap(id=>hcke.indexed[id].witness_ids)).sort(sortId)};
}

const glyph = card => card.slice(0,-1)+({H:'♥',D:'♦',C:'♣',S:'♠'})[card.at(-1)];
const end = text => /[.!?]$/.test(text)?text:text+'.';
const lower = value => value.charAt(0).toLowerCase()+value.slice(1);
const trimEnd = value => value.replace(/[.!?]+$/,'');
const joinWith = (values,lang) => values.length<2?values[0]??'':values.slice(0,-1).join(', ')+(lang==='el'?' και ':' and ')+values.at(-1);
const firstSentence = value => value.split(/(?<=[.!?])\s/u)[0];
const phrase = (id,context,lang) => trimEnd(context.hcke.indexed[id].historical_gloss[lang]);
function cardVoice(id, topic, context, lang) {
  const card = context.hcke.voices[id.slice(2)];
  const variant = card.contextual_reading;
  return firstSentence((variant.topic===topic?variant.text:card.text)[lang]);
}

export async function buildHckeNarrative(reading, context, fingerprint, topic='general') {
  const plan = planHcke(reading,context,topic);
  const refinements = new Map([...context.hcke.active.editorial_refinements,...context.hcke.active.optional_editorial_inspiration].map(x=>[x.id,x]));
  const title = context.hcke.policy.topics[topic];
  const encode = new TextEncoder();
  async function wording(opts,key) {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256',encode.encode(
      [HCKE_VERSION,context.hckeHash,fingerprint,topic,key].join('\0'))));
    return opts[hash[0]%opts.length];
  }
  async function local(lang) {
    const el = lang==='el';
    const opening = topic==='general'
      ? textPair('Η ανάγνωση ακολουθεί τις συναντήσεις του ανοίγματος και όσα επανέρχονται στα θεματικά πακέτα.',
        'The reading follows the encounters in the spread and the themes that return in the four packets.')
      : plan.focused ? await wording([
        textPair('Το θέμα της ανάγνωσης είναι «'+title.el+'». Τα κεντρικά φύλλα και οι συναντήσεις τους δείχνουν πού αξίζει να σταθείς.',
          'This reading focuses on '+title.en.toLowerCase()+'. The central cards and their encounters show where to pause.'),
        textPair('Η εστίαση είναι «'+title.el+'». Η βεντάλια δίνει τις συγκεκριμένες ενδείξεις και τα πακέτα τις βάζουν σε διαφορετικά συμφραζόμενα.',
          'The focus is '+title.en.toLowerCase()+'. The fan gives the individual cues, and the packets put them in different contexts.')
      ],'opening')
      : textPair('Το θέμα «'+title.el+'» έχει λίγα σαφή στηρίγματα σε αυτό το άνοιγμα. Η ανάγνωση ξεκινά από τις πιο καθαρές ενδείξεις.',
        'This spread gives little direct support for '+title.en.toLowerCase()+'. The reading starts from the clearest cues it does provide.');
    const sections=[];
    const usedNuances=new Set();
    const featured=new Set();
    const attach = (text,id) => {
      if (!id || usedNuances.has(id)) return text;
      usedNuances.add(id);
      return text+' '+refinements.get(id).rendering[lang];
    };
    for (const s of plan.sections) {
      if (s.kind==='multiple') {
        const pattern = joinWith(s.cards.map(glyph),lang);
        const motive = phrase(s.ids[0],context,lang);
        const extra = s.recipes.includes('S-R13') ? (el
          ? ' Η αλλαγή και η απογοήτευση έχουν διαφορετικό βάρος στην ανάγνωση.'
          : ' Change and disappointment carry different weight in the reading.') : '';
        const text = (el ? 'Η ίδια αξία επανέρχεται στα '+pattern+'. Ο Θησαυρός συνδέει αυτό το ακριβές πλήθος με '+lower(motive)+'.'
          : 'The same rank returns in '+pattern+'. Thesavros associates this exact count with '+lower(motive)+'.')+extra;
        sections.push({heading:el?'Η επανάληψη στη βεντάλια':'The repeating rank',text:attach(text,s.nuance)});
        continue;
      }
      const stop=plan.stops[s.stop-1];
      const [centre,...others]=s.ids;
      const pairIds=others.filter(id=>id.startsWith('A-P'));
      let text=cardVoice(centre,topic,context,lang);
      featured.add(centre);
      if (s.recipes.includes('S-R03')) {
        text+=' '+(el?'Η ίδια συνάντηση της ντάμας και του άσου κούπα δίνει δύο αναγνώσεις στο τεύχος, ευχάριστη είδηση και γάμο με οικονομική άνεση. Καθεμία έχει δικό της βάρος.'
          :'The Queen and Ace of Hearts have two readings in the issue, welcome news and a prosperous marriage. Each carries weight in its own right.');
      } else if (s.recipes.includes('S-R01')) {
        const left=pairIds.filter(id=>stop.left.some(o=>o.source===id));
        const right=pairIds.filter(id=>stop.right.some(o=>o.source===id));
        text+=' '+(el?'Η αριστερή πλευρά δίνει '+joinWith(left.map(id=>lower(phrase(id,context,lang))),lang)+'. Η δεξιά πλευρά δίνει '+joinWith(right.map(id=>lower(phrase(id,context,lang))),lang)+'.'
          :'The pairing on the left points to '+joinWith(left.map(id=>lower(phrase(id,context,lang))),lang)+'. On the right, the pairing points to '+joinWith(right.map(id=>lower(phrase(id,context,lang))),lang)+'.');
        text+=' '+(s.ids.includes('A-P63')&&s.ids.includes('A-P65')?(el
          ? 'Η εισροή και η απώλεια έχουν δική τους θέση. Η ανάγνωση αφήνει ανοιχτό πώς συνδέονται.'
          : 'The receipt and the loss both stand. The reading leaves open how they are connected.') : centres.mixed[lang]);
      } else if (s.recipes.includes('S-R11')) {
        text+=' '+(el?'Το ζεύγος συνδέει τη δυσκολία με προστασία. Το ιστορικό χωρίο αφήνει ανοιχτό τον ρόλο της γυναίκας στη συνάντηση.'
          :'The pairing links the difficulty with protection. The historical passage leaves the woman’s role in the encounter open.');
      } else if (s.recipes.includes('S-R15')) {
        text+=' '+(el?'Η γενική προοπτική κέρδους έχει θέση στην ανάγνωση. Για τα συγκεκριμένα αναμενόμενα χρήματα η συνάντηση δίνει διαφορετική ένδειξη. Η είσπραξη δεν φαίνεται να έρχεται.'
          :'The wider prospect of gain remains in the reading. The pair gives a different cue for the particular money expected. That payment does not come through.');
      } else if (pairIds.length) {
        const frame=await wording([textPair('Η ειδική συνάντηση φέρνει στο προσκήνιο ','The specific pairing brings another detail into view: '),
          textPair('Ο γείτονας δίνει συγκεκριμένη κατεύθυνση στην ένδειξη, ','The neighbour gives the cue a specific direction: ')],'pair:'+s.stop);
        text+=' '+end(frame[lang]+joinWith(pairIds.map(id=>lower(phrase(id,context,lang))),lang));
      } else if (s.recipes.includes('S-R06')) {
        text+=' '+(el?'Το θέμα και ο αποστολέας του μηνύματος μένουν ανοιχτά όπου το άνοιγμα δεν τα προσδιορίζει.'
          :'Where the spread leaves the subject and sender unspecified, both remain open.');
      }
      if (s.recipes.includes('S-R07')) text+=' '+centres.support[lang];
      if (s.recipes.includes('S-R05')) {
        text+=' '+(el?'Ο άσος σπαθί μετριάζει τον δυσμενή τόνο '+(s.mitigation.length===1?'του φύλλου ':'των φύλλων ')+joinWith(s.mitigation.map(glyph),lang)+'. Η δυσκολία παραμένει ορατή.'
          :'The Ace of Clubs softens the adverse tone at '+joinWith(s.mitigation.map(glyph),lang)+'. The difficulty remains visible.');
      }
      if (s.recipes.includes('S-R14') && !pairIds.length) text+=' '+(el?'Η ειδική ιστορική ένδειξη παραμένει στο τεκμήριο.':'The specific historical interpretation is available in the source notes.');
      sections.push({heading:(el?'Στάση ':'Stop ')+s.stop+' · '+glyph(stop.centre),text:attach(end(text),s.nuance)});
    }
    const packets=[];
    for (const pack of plan.packets) {
      const ids=pack.claims;
      const lead=ids.find(id=>themesMatch(topic,context.hcke.voices[id.slice(2)].topics))??ids[0];
      const rest=ids.filter(id=>id!==lead);
      const motif=id=>context.hcke.voices[id.slice(2)].packet_motif[lang];
      const lines=rest.map(motif);
      const withEcho=featured.has(lead);
      const intro = withEcho ? await wording([
        textPair('Το πακέτο ξαναφέρνει στο προσκήνιο ','This packet brings back '),
        textPair('Εδώ επανέρχεται ένα γνώριμο θέμα, ','A familiar theme returns here: ')
      ],'echo:'+pack.topic) : null;
      const leadLine=intro ? end(intro[lang]+motif(lead)) : cardVoice(lead,topic,context,lang);
      featured.add(lead);
      const remainingTones=rest.map(id=>tag(context.knowledge,id)[1]);
      const leadTone=tag(context.knowledge,lead)[1];
      let secondary;
      if (pack.recipes.includes('S-R09') && remainingTones.includes('+')&&remainingTones.includes('-')) {
        const pos=rest.find(id=>tag(context.knowledge,id)[1]==='+');
        const neg=rest.find(id=>tag(context.knowledge,id)[1]==='-');
        secondary=(el?'Στο ίδιο πακέτο συνυπάρχουν ':'In the same packet there is room for ')+motif(pos)+
          (el?' αλλά και ':' as well as ')+motif(neg);
      } else if (pack.recipes.includes('S-R09') && remainingTones.every(t=>t!==leadTone)) {
        secondary=(el?'Στο ίδιο πακέτο εμφανίζονται επίσης ':'The packet also leaves room for ')+joinWith(lines,lang);
      } else {
        const opts=[textPair('Στο ίδιο πακέτο διακρίνονται ','The same packet also shows '),
          textPair('Την εικόνα συμπληρώνουν ','The picture also includes '),
          textPair('Πλάι σε αυτό εμφανίζονται ','Alongside this you can also see ')];
        secondary=(await wording(opts,'packet:'+pack.topic))[lang]+joinWith(lines,lang);
      }
      const echo=pack.recipes.includes('S-R10')&&!withEcho&&pack.topic==='unexpected'?' '+centres.echo[lang]:'';
      packets.push({heading:stageHeadings[pack.topic][lang],text:attach(leadLine+' '+end(secondary)+echo,pack.nuance)});
    }
    return {introduction:opening[lang],sections,packets,conclusion:closings[plan.focused?topic:'general'][lang]};
  }
  const [el,en]=await Promise.all(languages.map(local));
  return {engine:HCKE_VERSION,knowledge_sha256:context.hckeHash,topic,plan,el,en};
}
