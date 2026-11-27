import {element, currentLanguage, SOURCE_URL, clearPreference} from './strings.js?v=2.0.0';

const root = new URL('../', import.meta.url);
const archive = new URL('Seismiki-Chartomanteia-source.zip', root);
const urls = {
  credit:'https://lyk.gr/', agpl:'https://www.gnu.org/licenses/agpl-3.0.html',
  cc:'https://creativecommons.org/licenses/by-sa/4.0/', copyleft:'https://en.wikipedia.org/wiki/Copyleft',
  repository:'https://github.com/dosgr/Seismic-Cartomancy',
  seismo:'https://dos.gr/seismo/', git:'https://github.com/dosgr/SEISMO',
  deck:'https://github.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards/tree/3765067c32fcef42a30e87022332db729658e7cd'
};
const seismic = [
  ['EPOS France · CL','https://doi.org/10.15778/RESIF.CL'],
  ['EarthScope · HT','https://doi.org/10.7914/SN/HT'],
  ['NOA · HL','https://doi.org/10.7914/SN/HL'],
  ['GEOFON · GE','https://doi.org/10.14470/TR560404'],
  ['GSN · IU','https://doi.org/10.7914/SN/IU'],
  ['SCSN · CI','https://doi.org/10.7914/SN/CI']
];
const text = {
  credits:['Πηγές, άδειες και απόρρητο','Sources, licenses and privacy'],
  idea:['Ιδέα & δημιουργία: Λυκούργος Κεκεμπάνος','Idea & creation: Lykourgos Kekempanos'],
  gpt:['Με τη συνδρομή της τεχνητής νοημοσύνης GPT.','With the assistance of GPT artificial intelligence.'],
  about:['Η εφαρμογή','About the app'],
  aboutBody:['Δωρεάν πείραμα που συνδυάζει πραγματικές σεισμολογικές καταγραφές με την ελληνική χαρτομαντεία. Ακολουθεί τη Μέθοδο των 7 του 1953 και τον ανοιχτό μηχανισμό του SEISMO. Έχει ψυχαγωγικό, ιστορικό και πολιτιστικό χαρακτήρα.','A free experiment combining real seismic recordings with Greek cartomancy. It follows the 1953 Method of Seven and uses the open SEISMO engine. The experience is historical, cultural and for entertainment.'],
  code:['Κώδικας και περιεχόμενο','Code and content'],
  source:['Πηγαίος κώδικας αυτής της έκδοσης','Source code for this release'],
  original:['Κώδικας GNU AGPL v3 · Πρωτότυπο περιεχόμενο CC BY-SA 4.0.','Code under GNU AGPL v3 · Original content under CC BY-SA 4.0.'],
  historical:['Ιστορική πηγή','Historical source'],
  issue:['Θησαυρός, τεύχος 770, 30 Αυγούστου 1953, σ. 26–27 · Μέθοδος των 7','Thesavros, issue 770, 30 August 1953, pp. 26–27 · Method of Seven'],
  supplemental:['Συμπληρωματικές πηγές','Comparative sources'],
  readingDocs:['Κατάλογος πηγών και χρήση τους','Source catalog and how it was used'],
  upstream:['Τεχνολογική προέλευση','Technology provenance'],
  recordings:['Σεισμολογικά δίκτυα','Seismic networks'],
  artwork:['Γραφικά και τυπογραφία','Artwork and typography'],
  artworkBody:['Οι 52 όψεις προέρχονται από την τράπουλα CC0 του Austin Gabriel. Η εικονογράφηση εισόδου και κοινωνικής κοινοποίησης δημιουργήθηκε για το έργο. Τα εικονίδια είναι τοπικά και η τυπογραφία χρησιμοποιεί γραμματοσειρές του συστήματος.','The 52 faces come from Austin Gabriel’s CC0 deck. The hero and social illustrations were created for this project. Icons are shipped locally and typography uses system fonts.'],
  privacy:['Απόρρητο','Privacy'],
  privacyLocal:['Η προσωπική φιγούρα, η γλώσσα και η προτίμηση κίνησης αποθηκεύονται τοπικά. Το άνοιγμα και η απόδειξή του μένουν στη μνήμη της σελίδας μέχρι να φύγεις ή να τα κατεβάσεις. Η εφαρμογή δεν εγκαθιστά cookies και δεν ενσωματώνει analytics.','Your significator, theme, language and motion preference are stored locally. Readings and proofs stay in page memory until you leave or download them. The app sets no cookies and embeds no analytics.'],
  privacyNetwork:['Σε ζωντανό γύρο και αν ζητήσεις ανάκτηση απόδειξης, ο browser συνδέεται απευθείας με NOA, EPOS France, GFZ, SCEDC και EarthScope. Οι υπηρεσίες λαμβάνουν τη διεύθυνση IP και τα στοιχεία σταθμού, καναλιού και χρονικού παραθύρου που απαιτεί το αίτημα. Η προσωπική φιγούρα και η αφήγηση δεν αποστέλλονται στους σταθμούς. Η κοινοποίηση, όταν την επιλέξεις, ανοίγει τον διάλογο του συστήματός σου.','Live rounds and requested proof retrieval contact NOA, EPOS France, GFZ, SCEDC and EarthScope directly. Providers see your IP address and the station, channel and time window needed for the request. Your significator and narrative are not sent to those stations. Sharing opens your system’s share dialog when you choose it.'],
  erase:['Διαγραφή τοπικών προτιμήσεων','Clear local preferences'],
  erased:['Οι προτιμήσεις διαγράφηκαν. Ισχύει την επόμενη φορά που θα ανοίξεις τη σελίδα.','Preferences cleared. This takes effect the next time you open the page.']
};
function link(title,href) {
  const a = element('a','',title);
  a.href = href;
  return a;
}
function links(rows) {
  const p = element('p');
  for (const [i,[title,href]] of rows.entries()) {
    if (i) p.append(' · ');
    p.append(link(title,href));
  }
  return p;
}

export function renderCredits(knowledge) {
  const i = currentLanguage() === 'en' ? 1 : 0;
  const t = key => text[key][i];
  const footer = document.querySelector('.site-footer');
  const detail = document.querySelector('#credits');
  const open = detail.open || location.hash === '#credits';
  const footerLink = (title, href) => {
    const a = link(title, href);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  };
  const idea = element('p');
  idea.append(t('idea')+' | ',footerLink('Lyk.Gr',urls.credit));
  const legal = element('p');
  legal.append('(ↄ) ',footerLink('Copyleft',urls.copyleft),' 2026–27 — ',
    footerLink('AGPL v3',urls.agpl),i ? ' / Lyk · ' : ' / Λυκ · ',footerLink('CC BY-SA 4.0',urls.cc));
  const repository = element('p');
  const icon = element('span','','🔗');
  icon.setAttribute('aria-hidden','true');
  repository.append(icon,' ',footerLink(urls.repository,urls.repository));
  footer.replaceChildren(idea,element('p','',t('gpt')),legal,repository);
  detail.replaceChildren(element('summary','',t('credits')));
  detail.open = open;
  const block = (key,...nodes) => detail.append(element('h3','',t(key)),...nodes);
  block('about',element('p','',t('aboutBody')));
  block('code',element('p','',t('original')),links([[t('source'),archive]]));
  block('historical',links([[t('issue'),SOURCE_URL]]));
  block('supplemental',links([...(knowledge ? Object.values(knowledge.sources) : []),
    [t('readingDocs'),new URL('docs/RESEARCH.md',root)]]));
  block('upstream',links([['SEISMO',urls.seismo],['GitHub · SEISMO',urls.git]]));
  block('recordings',links(seismic));
  block('artwork',element('p','',t('artworkBody')),links([['Austin Gabriel · CC0 playing cards',urls.deck]]));
  const reset = element('button','quiet',t('erase'));
  reset.type = 'button';
  const status = element('p','field-note');
  status.setAttribute('role','status');
  reset.addEventListener('click',() => {
    for (const key of ['lang','figure','theme','reduced-motion']) {
      clearPreference(key);
    }
    status.textContent = t('erased');
  });
  block('privacy',element('p','',t('privacyLocal')),element('p','',t('privacyNetwork')),reset,status);
}
