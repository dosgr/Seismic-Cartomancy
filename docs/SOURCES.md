# Πηγές, άδειες και αναφορά / Sources, licenses and attribution

## SEISMO

Ο μηχανισμός συλλογής, ο αποκωδικοποιητής miniSEED 2, ο κατάλογος και η κρυπτογραφική επαλήθευση προέρχονται από το **SEISMO v1.0.0**, Λυκούργος Κεκεμπάνος / Lyk.Gr, 2026. [Upstream commit d77e837](https://github.com/dosgr/SEISMO/tree/d77e837f37ab03514ffee529209b68b457ec6270).

- `js/mseed.js`, `js/live.js`, `stations.txt` are carried over unchanged. In `js/proof.js`, the canonical input builder was extracted from the existing P3/P4 computation. This refactoring preserves the canonical bytes and the original P3/P4 output. The card layer and its UI are additions.
- Derivative code is distributed under [GNU AGPL v3](../LICENSE). The installation archive includes a clearly linked, complete corresponding source archive with tests and scripts. Preserve the notices and license when serving or distributing the release. [GNU AGPL](https://www.gnu.org/licenses/agpl-3.0.en.html)
- The copied upstream algorithm and upstream notices retain their author credits and original terms. Original SEISMO documentation/content is CC BY‑SA 4.0. [Upstream notice](NOTICE.md) · [Upstream content license](LICENSE-CONTENT.md)

## Ιστορική πηγή / Historical source

*Θησαυρός*, Αθήνα, τεύχος 770, 30 Αυγούστου 1953, σ. 26–27. Το έργο αναφέρει το τεκμήριο της Εταιρείας Ηπειρωτικών Μελετών και περιέχει νέες σύντομες αποδόσεις των κανόνων σε EL/EN. Το ZIP δεν αναδιανέμει σάρωση του περιοδικού, εικονογράφηση, OCR ή αυτούσια εκτενή μεταγραφή. Αυτά θα χρειάζονταν χωριστό έλεγχο δικαιωμάτων, συμπεριλαμβανομένων των άρθρων 30–31 του ν. 2121/1993 και των όρων του φορέα. [Πλήρες τεύχος](https://ehm-admin.repository.gr/files/original/c09215b5410dae7316d22936185f0bd1cc3c3d97.pdf) · [Οργανισμός Πνευματικής Ιδιοκτησίας](https://opi.gr/vivliothiki/nomos-2121-1993/)

## Waveforms

- NOA network HL and GEOFON GE are marked CC BY 4.0 in upstream's notices and catalog. Only these networks are eligible to have original miniSEED embedded by this version, and only when the route's redistribution flag is set. `tests/fixtures/noa-archive.json` contains three NOA recordings from upstream's archived demonstration with the original attribution. [NOA HL · DOI 10.7914/SN/HL](https://doi.org/10.7914/SN/HL) · [GEOFON GE · DOI 10.14470/TR560404](https://doi.org/10.14470/TR560404) · [Όροι EIDA/NOA](https://eida2.gein.noa.gr/waveform/) · [GFZ data license](https://geofon.gfz.de/doi/network/GE)
- SCEDC/CI and EarthScope routes retain network and station attribution. The generated JSON leaves their restricted recordings with hashes and exact-window provider links. The verifier can retrieve or read those files locally. These recordings are not bundled in the installation or source ZIP. [SCEDC citation](https://scedc.caltech.edu/about/citation.html) · [IU network](https://www.fdsn.org/networks/detail/IU/) · [EarthScope access and terms](https://service.earthscope.org/fdsnws/)
- Dataselect usage is bounded and on demand. The provider policies distinguish this from continuous polling. [FDSN web services](https://www.fdsn.org/webservices/) · [SCEDC Dataselect](https://service.scedc.caltech.edu/fdsnws/dataselect/1/)

## Assets

- Playing-card faces from Austin Gabriel, *Public Domain and CC0 Playing Cards*, commit `3765067c32fcef42a30e87022332db729658e7cd`. The upstream repository dedicates the deck under CC0. The 52 supplied faces were resized and re-encoded as WebP. The license is preserved in [assets/cards/CC0.txt](../assets/cards/CC0.txt). [Deck source](https://github.com/AustinGabriel/Public-Domain-and-CC0-Playing-Cards/tree/3765067c32fcef42a30e87022332db729658e7cd)
- `assets/table.webp` is a new generated illustrative still life for this project. The project favicon and CSS card backs are original project assets. There are no round-time image, AI or external font calls.
- Asset and code provenance were reviewed for this private package. Public deployment remains subject to the owner's approval and the provider terms applicable to that deployment.

### Έκδοση 1.1.0

Η τεκμηρίωση [RESEARCH.md](RESEARCH.md) περιλαμβάνει τις πρόσθετες ελληνικές και αγγλόφωνες πηγές και τις έννοιες που αξιοποιήθηκαν. Το νέο Open Graph JPEG `assets/social.jpg` συνδυάζει δημιουργημένη για το έργο εικονογράφηση με τοπική τυπογραφική σύνθεση. Τα manifest icons και τα touch icons προέρχονται από το νέο σήμα της εφαρμογής. Για τη διεπαφή χρησιμοποιούνται γραμματοσειρές συστήματος. Η εφαρμογή δεν ενσωματώνει χάρτες ή απομακρυσμένες γραμματοσειρές.

Οι οδηγίες δομής metadata αντλούνται από τον [Open Graph Protocol](https://ogp.me/), τον τύπο [Schema.org WebApplication](https://schema.org/WebApplication) και τη ζωντανή εφαρμογή [SEISMO](https://dos.gr/seismo/). Ο κανόνας Apache στηρίζεται στην [τεκμηρίωση mod_rewrite 2.4](https://httpd.apache.org/docs/2.4/rewrite/remapping.html).
