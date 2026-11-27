export const SOURCE_URL = 'https://ehm-admin.repository.gr/files/original/c09215b5410dae7316d22936185f0bd1cc3c3d97.pdf';
const words = {
  readingTheme:['Θέμα ανάγνωσης','Reading theme'],
  extendedRound:['330 s · εκτεταμένες εφεδρείες','330 s · extended backups'],
  hckeSources:['Τεκμήρια της σύνθεσης','Evidence behind the reading'],
  synthesisLabel:['Σύγχρονη συμβολική απόδοση','Modern symbolic interpretation'],
  narrationUnavailable:['Τα φύλλα επαληθεύτηκαν. Για την αφήγηση χρειάζεται η ακριβής έκδοση του HCKE.','Cards verified. The narrative requires the exact HCKE edition.'],
  greekOnly:['Ελληνικοί σταθμοί','Greek stations'],
  mixedSites:['Ελληνικοί και διεθνείς σταθμοί','Greek and international stations'],
  worldOnly:['Διεθνείς σταθμοί','International stations'],

  narrativeTitle: ['Τι σου λένε τα χαρτιά','What the Cards Tell You'],
  packetNarrative: ['Τα τέσσερα πακέτα στην αφήγησή σου','The four packets in your story'],
  otherReadings: ['Συμπληρωματικές αναγνώσεις άλλων πηγών','Comparative readings from other sources'],
  otherReadingsNote: ['Οι παραδόσεις αυτές προσθέτουν πλαίσιο στην ανάγνωσή σου. Όπου διαφέρουν, η κύρια αφήγηση ακολουθεί τον Θησαυρό του 1953.','These traditions add context to your reading. Where they differ, the main story follows Thesavros (1953).'],
  otherMeaning: ['Άλλη ερμηνεία','Different reading'],
  relatedMeaning: ['Συγγενική ερμηνεία','Related reading'],
  copyNarrative: ['Αντιγραφή','Copy'],
  printNarrative: ['Εκτύπωση','Print'],
  saveNarrative: ['Αποθήκευση TXT','Save TXT'],
  shareNarrative: ['Κοινοποίηση','Share'],
  copiedNarrative: ['Η αφήγηση αντιγράφηκε.','Reading copied.'],
  copyUnavailable: ['Η αντιγραφή δεν είναι διαθέσιμη. Μπορείς να αποθηκεύσεις την αφήγηση ως TXT.','Clipboard access is unavailable. You can save the reading as TXT.'],
  shareUnavailable: ['Η κοινοποίηση δεν ολοκληρώθηκε.','The share did not complete.'],
  knowledge: ['Η έκδοση ή η αναπαραγωγή της αφήγησης δεν συμφωνεί με την απόδειξη.','The narrative version or reconstruction does not match the proof.'],
  skip: ['Μετάβαση στο περιεχόμενο', 'Skip to content'],
  brand: ['ΧΑΡΤΟΜΑΝΤΕΙΑ', 'CARTOMANCY'],
  navigation: ['Πλοήγηση', 'Navigation'],
  language: ['Γλώσσα', 'Language'],
  navTable: ['Το τραπέζι', 'The table'],
  navMethod: ['Η μέθοδος', 'The method'],
  verify: ['Επαλήθευση', 'Verify'],
  edition: ['ΘΗΣΑΥΡΟΣ · 1953', 'THESAVROS · 1953'],
  title: [['Σεισμική', 'Χαρτομαντεία'], ['Seismic', 'Cartomancy']],
  lede: ['Η ιστορική Μέθοδος των 7 με κοινή τράπουλα. Το ανακάτεμα αντλείται από πραγματικές σεισμολογικές καταγραφές.', 'The historic Method of Seven with a standard deck. The shuffle draws on real seismic recordings.'],
  figure: ['Προσωπική φιγούρα', 'Significator'],
  choose: ['Επίλεξε φύλλο', 'Choose a card'],
  figureHelp: ['Η φιγούρα αποθηκεύεται σε αυτή τη συσκευή.', 'Your choice is saved on this device.'],
  start: ['Ρίξε τα φύλλα', 'Deal the cards'],
  again: ['Νέο άνοιγμα', 'Deal again'],
  timing: ['Χρονικές ρυθμίσεις', 'Timing settings'],
  sample: ['Παράθυρο δειγμάτων', 'Sample window'],
  round: ['Διάρκεια γύρου', 'Round duration'],
  heroCredit: ['ΜΕΘΟΔΟΣ ΤΩΝ 7', 'METHOD OF SEVEN'],
  heroCount: ['52 ΦΥΛΛΑ', '52 CARDS'],
  tableLabel: ['ΤΟ ΑΝΟΙΓΜΑ', 'THE SPREAD'],
  tableTitle: ['Το τραπέζι', 'The table'],
  reduce: ['Μείωση κίνησης', 'Reduce motion'],
  progress: ['Πρόοδος ανάγνωσης', 'Reading progress'],
  fan: ['Βεντάλια 12 φύλλων', '12-card fan'],
  packTable: ['Τέσσερις τριάδες', 'Four packets of three'],
  retry: ['Η βεντάλια δεν περιέχει φιγούρα ή εφεδρικό φύλλο. Το ρίξιμο επαναλαμβάνεται.', 'The fan contains neither the significator nor a substitute. Dealing again.'],
  collect: ['Συλλογή', 'Collect'],
  shuffle: ['Ανακάτεμα', 'Shuffle'],
  cut: ['Κόψιμο', 'Cut'],
  deal: ['Μοίρασμα', 'Deal'],
  count: ['Ανά επτά', 'Count in sevens'],
  packets: ['Θεματικά πακέτα', 'Themed packets'],
  download: ['Λήψη απόδειξης JSON', 'Download proof JSON'],
  telemetry: ['Σεισμολογική συλλογή', 'Seismic collection'],
  stations: ['Σταθμοί και λήψεις', 'Stations and recordings'],
  noWave: ['Η κυματομορφή εμφανίζεται όταν ληφθούν δείγματα.', 'The waveform appears when samples arrive.'],
  waveFor: ['Κυματομορφή', 'Waveform'],
  fullRoutes: ['Πλήρεις διαδρομές', 'Complete routes'],
  selectedSites: ['Επιλεγμένοι σταθμοί', 'Selected stations'],
  idle: ['Επίλεξε φιγούρα και ξεκίνα το άνοιγμα.', 'Choose a significator and start the reading.'],
  idleSelected: ['Το τραπέζι είναι έτοιμο για νέο άνοιγμα.', 'The table is ready for a new reading.'],
  collecting: ['Συλλέγονται σεισμολογικά δείγματα στο δεσμευμένο παράθυρο.', 'Collecting seismic samples in the reserved window.'],
  sealed: ['Η συλλογή πάγωσε. Ελέγχεται η κάλυψη των σταθμών.', 'Collection is closed. Checking station coverage.'],
  shuffling: ['Ανακατεύονται τα 52 φύλλα.', 'Shuffling the 52 cards.'],
  cutting: ['Κόψιμο των 52 φύλλων', 'Cutting the 52 cards'],
  dealing: ['Κρατάμε κάθε έβδομο φύλλο ώσπου να σχηματιστεί η βεντάλια.', 'Every seventh card is kept until the fan is complete.'],
  counting: ['Η καταμέτρηση ξεκινά από την προσωπική φιγούρα.', 'Counting starts at the significator.'],
  shuffle12: ['Ανακατεύονται ξανά τα 12 φύλλα της βεντάλιας.', 'The 12 cards in the fan are shuffled again.'],
  cut12: ['Κόψιμο των 12 φύλλων', 'Cutting the 12 cards'],
  packetStatus: ['Τα δώδεκα φύλλα μοιράζονται σε τέσσερις τριάδες.', 'The twelve cards are dealt into four packets of three.'],
  ready: ['Το άνοιγμα ολοκληρώθηκε.', 'The reading is complete.'],
  noData: ['Δεν εκδόθηκε αποτέλεσμα. Στο πάγωμα χρειάζονται τρεις πλήρεις, διαφορετικοί σταθμοί.', 'No result. Three distinct stations with complete windows are needed at cutoff.'],
  noFigure: ['Εξαντλήθηκαν οι προσπάθειες χωρίς την επιλεγμένη φιγούρα ή κάποιο εφεδρικό φύλλο.', 'The attempts ended without the chosen significator or either historical substitute.'],
  operationError: ['Η συλλογή διακόπηκε από τεχνικό σφάλμα.', 'A technical error interrupted the round.'],
  resources: ['Δεν φορτώθηκαν ο κατάλογος ή οι κανόνες. Έλεγξε τη σύνδεση και ανανέωσε τη σελίδα.', 'The catalog or rules could not be loaded. Check the connection and reload the page.'],
  crypto: ['Χρειάζεται HTTPS ή localhost με υποστήριξη Web Crypto.', 'Use HTTPS or localhost with Web Crypto support.'],
  source: ['Θησαυρός 770 · σ. 26–27', 'Thesavros 770 · pp. 26–27'],
  page: ['σ.', 'p.'],
  history: ['Ιστορικός κανόνας', 'Historical method'],
  historyText: ['Μετά το ανακάτεμα και το κόψιμο, κρατάμε κάθε έβδομο φύλλο. Διαβάζουμε τα όμοια φύλλα και επτά στάσεις γύρω από τη φιγούρα. Τα ίδια 12 φύλλα επιστρέφουν σε τέσσερα θεματικά πακέτα.', 'After shuffling and cutting, every seventh card is kept. Matching ranks are read first, followed by seven stops around the significator. The same 12 cards are then dealt into four themed packets.'],
  digital: ['Ψηφιακές συμβάσεις', 'Digital conventions'],
  digitalText: ['Τα άκρα της βεντάλιας γειτονεύουν. Αν λείπει η φιγούρα, προηγείται το 7 κούπα από το 7 σπαθί. Κάθε διάταξη προκύπτει από το σεισμικό αποτύπωμα. Η συνολική ανάγνωση συγκεντρώνει τις πηγές και τις ενδείξεις όπως εμφανίστηκαν.', 'The ends of the fan are adjacent. If the significator is absent, the Seven of Hearts takes priority over the Seven of Clubs. Each layout derives from the seismic fingerprint. The complete reading brings the recorded indications and their sources together.'],
  methodTitle: ['Η μέθοδος πίσω από τα φύλλα', 'The method behind the cards'],
  algorithm: ['Αλγόριθμος και απόδειξη', 'Algorithm and proof'],
  entertainment: ['Ιστορική και πολιτιστική αναπαράσταση για ψυχαγωγία. Οι ερμηνείες δεν προβλέπουν πραγματικά γεγονότα.', 'A historical and cultural recreation for entertainment. The readings do not predict actual events.'],
  footer: ['Σεισμική Χαρτομαντεία · βασισμένη στο SEISMO του Λυκούργου Κεκεμπάνου', 'Seismic Cartomancy · based on SEISMO by Lykourgos Kekempanos'],
  code: ['Πηγαίος κώδικας', 'Source code'],
  licenses: ['Πηγές και άδειες', 'Sources and licenses'],
  readingTitle: ['Συνολική ανάγνωση', 'Complete reading'],
  readingNote: ['Οι ιστορικές ενδείξεις εμφανίζονται μαζί, ακόμη και όταν διαφέρουν.', 'The historical indications appear together, including when they differ.'],
  substitute: ['Ιστορική εφεδρεία', 'Historical substitute'],
  attempts: ['Προσπάθειες', 'Attempts'],
  same: ['Όμοια φύλλα', 'Matching ranks'],
  noneSame: ['Δεν υπάρχουν όμοιες αξίες στη βεντάλια.', 'No ranks repeat in the fan.'],
  stops: ['Επτά στάσεις ανάγνωσης', 'Seven reading stops'],
  stop: ['Στάση', 'Stop'],
  startAt: ['Αφετηρία', 'Start'],
  neighbors: ['Γείτονες', 'Neighbours'],
  returnFigure: ['Επιστροφή στην προσωπική φιγούρα', 'Return to the significator'],
  clubsAce: ['Κατά την ιστορική πηγή, ο Άσος σπαθί μετριάζει δυσμενείς σημασίες γειτονικών φύλλων.', 'In the historical source, the Ace of Clubs softens adverse meanings of neighbouring cards.'],
  personal: ['Προσωπικά', 'Personal'],
  family: ['Σπίτι και οικογένεια', 'Home and family'],
  future: ['Μελλοντικά γεγονότα', 'Future events'],
  unexpected: ['Απρόοπτο', 'The unexpected'],
  backTable: ['Πίσω στο τραπέζι', 'Back to the table'],
  proofLabel: ['ΚΡΥΠΤΟΓΡΑΦΙΚΗ ΑΠΟΔΕΙΞΗ', 'CRYPTOGRAPHIC PROOF'],
  verifyTitle: ['Επαλήθευση ανάγνωσης', 'Verify a reading'],
  verifyIntro: ['Άνοιξε ένα JSON από το τραπέζι. Ο verifier επανυπολογίζει τη σεισμική είσοδο, τη βεντάλια, τα πακέτα και τις ενδείξεις.', 'Open a JSON proof from the table. The verifier recomputes the seismic input, fan, packets and indications.'],
  proofFile: ['Απόδειξη γύρου (.json)', 'Round proof (.json)'],
  proofLimit: ['Ο έλεγχος αναπαράγει το αποτέλεσμα από τα διαθέσιμα τεκμήρια. Οι χρόνοι παραλαβής και η κάλυψη που δηλώνει η συσκευή χρειάζονται ανεξάρτητη παρατήρηση για εξωτερική πιστοποίηση.', 'Verification reproduces the result from the available evidence. Receipt times and coverage reported by the device require independent observation for external certification.'],
  checking: ['Έλεγχος απόδειξης…', 'Checking proof…'],
  verified: ['Η ανάγνωση επαληθεύτηκε.', 'Reading verified.'],
  verifiedNoFigure: ['Επαληθεύτηκε η εξάντληση των προσπαθειών χωρίς φιγούρα.', 'Attempts exhausted without a significator, as verified.'],
  reportedNoData: ['Καταγεγραμμένη λήξη χωρίς αποτέλεσμα. Τα διαθέσιμα τεκμήρια δεν δείχνουν τρεις πλήρεις σταθμούς.', 'Recorded close without a result. The available evidence does not show three complete stations.'],
  missing: ['Λείπουν πρωτογενή αρχεία miniSEED για πλήρη επαλήθευση.', 'Raw miniSEED files are needed to complete verification.'],
  providerFile: ['Λήψη από πάροχο', 'Download from provider'],
  attach: ['Προσθήκη miniSEED', 'Attach miniSEED'],
  fetchEvidence: ['Ανάκτηση από παρόχους', 'Retrieve from providers'],
  fetching: ['Ανακτώνται οι δηλωμένες λήψεις από τους παρόχους…', 'Retrieving the recorded windows from the providers…'],
  fetchSome: ['Κάποιες λήψεις παραμένουν μη διαθέσιμες ή διαφέρουν. Μπορείς να επισυνάψεις τα πρωτογενή αρχεία.', 'Some recordings remain unavailable or differ. You can attach the original files.'],
  size: ['Το μέγιστο μέγεθος ανά αρχείο είναι 60 MB.', 'The maximum size per file is 60 MB.'],
  invalid: ['Το αρχείο απόδειξης είναι άγνωστο ή δεν επαληθεύεται.', 'This proof file is unknown or failed verification.'],
  bundlehash: ['Το SHA‑256 του JSON δεν ταιριάζει.', 'The JSON SHA-256 does not match.'],
  rulehash: ['Η έκδοση ή το SHA‑256 των κανόνων δεν ταιριάζει.', 'The rules version or SHA-256 does not match.'],
  cataloghash: ['Ο κατάλογος της απόδειξης διαφέρει από τον κατάλογο αυτής της έκδοσης.', 'The proof’s catalog differs from this release’s catalog.'],
  seismicproof: ['Τα σεισμικά τεκμήρια δεν συμφωνούν με την απόδειξη.', 'The seismic evidence disagrees with the proof.'],
  reading: ['Τα φύλλα ή οι εφαρμοσμένοι κανόνες διαφέρουν από τον επανυπολογισμό.', 'The cards or applied rules differ from the recomputed reading.'],
  proofDigest: ['SHA‑256 απόδειξης', 'Proof SHA-256'],
  noContact: ['Αναμονή διαδρομής', 'Waiting for route'],
  full: ['Πλήρης λήψη', 'Complete window'],
  partial: ['Μερική κάλυψη', 'Partial coverage'],
  outside: ['Εκτός παραθύρου', 'Outside the window'],
  seedlink: ['Συνδρομή SeedLink 4', 'SeedLink 4 subscription'],
  wsOpening: ['Σύνδεση WSS', 'Connecting via WSS'],
  wsFail: ['Η διαδρομή WSS δεν ολοκληρώθηκε', 'WSS route did not complete'],
  due: ['Εκτός διαθέσιμου χρόνου', 'Outside the time budget'],
  retryAfter: ['Αναμονή λόγω ορίου παρόχου', 'Waiting for provider rate limit'],
  requesting: ['Αίτημα FDSN', 'FDSN request'],
  timeout: ['Λήξη χρόνου', 'Request timed out'],
  network: ['Αποτυχία HTTPS/CORS', 'HTTPS/CORS request failed'],
  noChannel: ['HTTP 200 · κανένα δείγμα καναλιού', 'HTTP 200 · no channel samples'],
  unparsed: ['Το miniSEED δεν έγινε δεκτό', 'miniSEED was rejected']
};
const suitNames = {D:['καρό','Diamonds','♦'], H:['κούπα','Hearts','♥'], S:['μπαστούνι','Spades','♠'], C:['σπαθί','Clubs','♣']};
const ranks = {A:['Άσος','Ace'], K:['Ρήγας','King'], Q:['Ντάμα','Queen'], J:['Βαλές','Jack']};
let language = 'el';

const sitePath = new URL('../', import.meta.url).pathname;
const storagePrefix = sitePath === '/seismiki/' ? 'seismo-cards:' : 'seismo-cards:' + sitePath + ':';

export function clearPreference(key) {
  try { localStorage.removeItem(storagePrefix + key); } catch { /* Storage is optional. */ }
}

export function stored(key) {
  try { return localStorage.getItem(storagePrefix + key); } catch { return null; }
}

export function store(key, value) {
  try { localStorage.setItem(storagePrefix + key, value); } catch { /* Storage is optional. */ }
}

export function tr(key) {
  return words[key][language === 'en' ? 1 : 0];
}

export function currentLanguage() { return language; }

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function localize(onChange) {
  const requested = new URL(location.href).searchParams.get('lang') ?? (document.documentElement.dataset.defaultLang === 'en' ? 'en' : stored('lang'));
  function set(lang) {
    language = lang === 'en' ? 'en' : 'el';
    document.documentElement.lang = language;
    const pageTitle = location.pathname.endsWith('verify.html') ? tr('verifyTitle') : tr('title').join(' ');
    document.title = pageTitle + ' · SEISMO';
    document.querySelectorAll('[data-t]').forEach(node => {
      const value = tr(node.dataset.t);
      if (Array.isArray(value)) node.replaceChildren(...value.map(line => element('span', 'title-line', line)));
      else node.textContent = value;
    });
    document.querySelectorAll('[data-aria]').forEach(node => node.setAttribute('aria-label', tr(node.dataset.aria)));
    document.querySelectorAll('[data-lang]').forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
    for (const link of document.querySelectorAll('a[data-verify], a[data-t="backTable"], a.brand')) {
      const href = new URL(link.getAttribute('href'), location.href);
      href.searchParams.set('lang', language);
      link.href = href.href;
      if (href.pathname.endsWith('verify.html')) link.dataset.verify = '';
    }
    document.querySelectorAll('#support-area [data-el][data-en]').forEach(node => {
      node.textContent = node.dataset[language];
    });
    for (const [attr, key] of [['aria-label','label'], ['alt','alt'], ['title','title']]) {
      document.querySelectorAll('#support-area [data-'+key+'-'+language+']').forEach(node =>
        node.setAttribute(attr,node.getAttribute('data-'+key+'-'+language)));
    }
    onChange();
  }
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {
    const lang = button.dataset.lang;
    store('lang', lang);
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
    set(lang);
  }));
  set(requested);
}

export function cardName(card) {
  const index = language === 'en' ? 1 : 0;
  const suit = suitNames[card.at(-1)];
  const rank = card.slice(0, -1);
  const name = ranks[rank]?.[index] ?? rank;
  return name + (index ? ' of ' : ' ') + suit[index];
}

export function shortCard(card) { return card.slice(0, -1) + suitNames[card.at(-1)][2]; }

export function sourcePage(page) {
  const link = element('a', 'page-ref', tr('page') + ' ' + page);
  link.href = SOURCE_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

export function routeLabel(value = '') {
  const literal = {
    'Προγραμματισμένη εφεδρεία': 'noContact', 'Πλήρης λήψη': 'full', 'Μερική κάλυψη': 'partial',
    'Εκτός παραθύρου': 'outside', 'Σύνδεση WSS': 'wsOpening', 'Συνδρομή SeedLink 4': 'seedlink',
    'Εκτός διαθέσιμου χρόνου': 'due', 'Σε αναμονή λόγω Retry-After / ορίου παρόχου': 'retryAfter',
    'Αίτημα FDSN': 'requesting', 'Λήξη χρόνου': 'timeout', 'Αποτυχία HTTPS/CORS': 'network',
    'HTTP 200 · κανένα δείγμα καναλιού': 'noChannel'
  };
  if (literal[value]) return tr(literal[value]);
  if (value.startsWith('miniSEED')) return tr('unparsed');
  if (value.startsWith('WSS') || value.startsWith('Όριο WSS')) return tr('wsFail');
  return /^HTTP \d{3}/.test(value) ? value.slice(0,8) : tr('noContact');
}

export function hasMessage(error) { return Object.hasOwn(words, error.message); }
