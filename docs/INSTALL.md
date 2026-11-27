# Εγκατάσταση / Installation

## Υφιστάμενος φάκελος cPanel

1. Κράτησε αντίγραφο του υπάρχοντος φακέλου πριν την αντικατάσταση.
2. Ανέβασε το προσωπικό **Seismic-Cartomancy-v2.0.0-cPanel.zip** στον φάκελο **seismiki/**, συνήθως **public_html/seismiki/**. Στο File Manager επίλεξε **Extract** μέσα σε αυτόν τον φάκελο και επίτρεψε αντικατάσταση. Τα `index.html`, `en/` και `donate-config.js` βρίσκονται στη ρίζα του ZIP.
3. Άνοιξε [Ελληνικά](https://dos.gr/seismiki/), [Αγγλικά](https://dos.gr/seismiki/en/) και [Επαλήθευση](https://dos.gr/seismiki/verify.html). Κάνε πλήρη ανανέωση αν ο browser κρατά παλιό HTML.
4. Η προσωπική διανομή έχει ήδη έτοιμους τους διακόπτες και τα QR. Το πλαίσιο ανοίγει με το Donate ή με τον τίτλο της αναδιπλούμενης ενότητας. Περισσότερα στις [ρυθμίσεις υποστήριξης](SUPPORT.el.md).

Το δημόσιο ZIP **Seismic-Cartomancy-v2.0.0-cPanel-public.zip** χρησιμοποιεί την ίδια εφαρμογή με κενές ρυθμίσεις πληρωμών και χωρίς QR προορισμών. Και τα δύο ZIP περιέχουν το `source.zip` και το αντίγραφό του `Seismiki-Chartomanteia-source.zip`. Χρειάζεται HTTPS για Web Crypto, ορισμός του `index.html` ως αρχείου ευρετηρίου και κανονικοί τύποι περιεχομένου για JS και JSON. Αν έχεις αυστηρό Content Security Policy, επίτρεψε στο `connect-src` τους ενεργούς προορισμούς HTTPS και WSS του `stations.txt`.

## Existing cPanel directory

Back up the current application directory. Upload the personal ZIP to **seismiki/** (typically **public_html/seismiki/**) and extract it directly there, allowing replacement. Open the [Greek](https://dos.gr/seismiki/) and [English](https://dos.gr/seismiki/en/) editions over HTTPS. If the browser still displays cached HTML, force a reload. The personal settings are ready to use. The public ZIP ships the same app with blank payment settings and excludes payment QR codes. See [support configuration](SUPPORT.md) for details. Both packages include the corresponding source. A static server with HTTPS, `index.html` as its directory index and correct JS/JSON media types is sufficient. Under a strict CSP, allow the station catalog’s active HTTPS and WSS endpoints in `connect-src`.

## Τοπικός έλεγχος και συσκευασία / Local testing and packaging

From the source archive, run `python3 dev.py` for a local HTTP server and `npm test` for the suite. Use `python3 release.py --out-dir releases` for the public packages. An operator with the original personal SEISMO v1.1.1 files can additionally pass `--personal-support-dir /path/to/extracted/seismo` to build the personal cPanel ZIP in the `personal/` output directory. Υποστηρίζεται Python 3.9+ / Requires Python 3.9+.
