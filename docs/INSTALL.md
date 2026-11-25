# Εγκατάσταση / Installation

## cPanel, Apache, Nginx

1. Δημιούργησε έναν φάκελο, π.χ. `public_html/chartomanteia/`. Ανέβασε το `Seismiki-Chartomanteia-1.0.0-install.zip` και κάνε εξαγωγή απευθείας εκεί. Το `index.html`, το `verify.html` και το `source.zip` πρέπει να βρίσκονται στο ίδιο επίπεδο.
2. Άνοιξε από HTTPS τη διεύθυνση του φακέλου. Η εφαρμογή χρησιμοποιεί σχετικά paths και μπορεί να εγκατασταθεί στο web root ή σε υποκατάλογο.
3. Σε Apache/Nginx, κράτησε το `index.html` ως index του φακέλου. Βεβαιώσου ότι ο server σερβίρει αρχεία `.js` με τύπο JavaScript και `.json` ως JSON. Οι ίδιες οδηγίες ισχύουν για στατική φιλοξενία. Δεν απαιτούνται PHP, βάση, rewrite rules ή server-side API.
4. Κράτησε διαθέσιμο το `source.zip` και το `LICENSE` δίπλα στην εφαρμογή. Το ZIP περιέχει τον αντίστοιχο πηγαίο κώδικα αυτής της έκδοσης.

Extract the installation archive into an HTTPS directory. Serve it as a regular static site with `index.html` as the directory index and standard MIME types. Keep the exact corresponding `source.zip` available in the same folder. GitHub permissions are not required.

## Local use and rebuild

Unpack `source.zip` and run `python3 dev.py` from its directory. Open `http://127.0.0.1:4173/`. Localhost is a secure context for Web Crypto. Opening the HTML as a `file:` URL cannot load the modules and local catalog reliably. Production should use HTTPS.

```sh
node --test tests/*.test.js
python3 release.py --out-dir releases
```

The release script uses only the Python standard library. It writes an installation ZIP and separate source ZIP, directly from the files in this project. It includes no dependency on SEISMO's earlier phase ZIPs. To serve the complete built release locally, extract the install ZIP and run `python3 -m http.server 4173 --bind 127.0.0.1` inside it.

## Live providers and verification

The browser connects directly to the entries marked active for browser use in `stations.txt`. A deployment with a custom content security policy must allow those HTTPS and WSS `connect-src` destinations. Provider outages, availability, CORS, browser throttling and forwarding delays can produce **no result**. Open the station panel to inspect the individual responses. There is no replacement source of randomness.

To verify saved evidence, visit `verify.html` on this release. Upload the JSON. For non-embedded recordings use **Retrieve from providers** for grouped, exact-window FDSN requests, or attach the original miniSEED for the listed routes. Verification can run without Internet access if all relevant evidence is available locally.

For a higher-traffic rollout, review and confirm provider quotas and terms for the deployment before publishing. Keep a separate version of the verifier and catalog if you change this release's catalog or rules. A proof pins the issued versions, and the current verifier checks them against its own copies.

## Αναβάθμιση από 1.0.0 στον υπάρχοντα υποφάκελο

1. Κράτησε αντίγραφο του υπάρχοντος `public_html/seismiki/`, ιδίως τυχόν δικού σου `.htaccess`.
2. Αποσυμπίεσε το install ZIP στον ίδιο φάκελο, ώστε τα `index.html`, `verify.html` και `Seismiki-Chartomanteia-source.zip` να βρίσκονται δίπλα στο `en/`. Το `source.zip` διατηρείται ως συμβατό ψευδώνυμο.
3. Ενεργοποίησε «Show Hidden Files» στο cPanel για να δεις το `.htaccess`. Αν υπάρχουν δικοί σου κανόνες, συγχώνευσε τις οδηγίες του πακέτου στον υπάρχοντα φάκελο. Ο κανόνας αφορά μόνο το `dos.gr` και τη διαδρομή `/seismiki`. Χρησιμοποιεί το `HTTPS` του Apache. Αν το TLS τερματίζει σε CDN ή reverse proxy, όρισε την ανακατεύθυνση στο επίπεδο που γνωρίζει το πραγματικό scheme και μη χρησιμοποιήσεις διπλό redirect.
4. Έλεγξε την έκδοση στο `/seismiki/`, την αγγλική είσοδο `/seismiki/en/`, το `verify.html` και την εικόνα `/seismiki/assets/social.jpg`. Αν υπάρχει CDN, καθάρισε την cache αυτών των διαδρομών μετά την εγκατάσταση.
5. Οι τοπικές προτιμήσεις διατηρούνται στον ίδιο browser και origin. Ο verifier της έκδοσης 1.1.0 συνεχίζει να διαβάζει αποδείξεις της 1.0.0.

Μετά την εγκατάσταση, επιβεβαίωσε με `curl -I http://dos.gr/seismiki/` ότι η απόκριση ανακατευθύνει σε HTTPS και με `curl -IL https://dos.gr/seismiki/` ότι δεν υπάρχει βρόχος. Η εικόνα έχει δηλωθεί ως JPEG 1200 × 630 με απόλυτο URL. Οι πλατφόρμες κοινοποίησης διατηρούν δική τους cache και χρειάζονται έλεγχο αφού είναι διαθέσιμα τα νέα δημόσια assets.
