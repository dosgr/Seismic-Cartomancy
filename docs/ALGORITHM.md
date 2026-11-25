# Αλγόριθμος και επαλήθευση / Algorithm and verification

Card method **SEISMO-CARDS-v1** · Evidence schema **seismo-cards-proof.v1** · Rules **thesavros-770-method-7.v1**.

## Time and seismic evidence

The SEISMO browser collector is reused from commit `d77e837f37ab03514ffee529209b68b457ec6270`. The UTC start is the first strict 10 ms boundary after acceptance. The duration is one of 1, 3, 5, 10 s. Reveal is scheduled for 20, 30, 45 or 60 s after acceptance, with cutoff two seconds before reveal. The UTC reference is the device clock and elapsed time is monotonic. Provider requests use the original group limits, timeouts and support for FDSN Dataselect and SeedLink 4 WSS.

Candidates must have complete conflict-free sample positions over `[start, end)`. Routes are sorted by numeric priority then by `provider~protocol~id`. The first three distinct stations qualify, considering the same NET.STA or stations within less than 0.001° on both axes as one station. With fewer than three, the collector emits no result. These are real measurements of ground motion and can include ambient motion. The proof does not distinguish catalogued earthquakes from other motion in the recording.

P4 canonical bytes are ASCII `SEISMO-P4` + NUL, UTC `YYYY-MM-DDTHH:mm:ss.sssZ` + NUL, duration as uint32 BE, and for each selected station in order: ASCII NSLC + NUL, sample rate as uint32 BE and samples as int32 BE. Their SHA‑256 is the card seed. The proof still contains the upstream P4 counter, digest, selected byte and roulette checksum result so that the original verifier can recalculate the source transcript. The roulette number is not used by the cards.

## Card stream

1. Import the P4 SHA‑256 bytes as the public HMAC‑SHA‑256 key. For each operation select an independent stream named `shuffle52`, `cut52`, `shuffle12` or `cut12`.
2. Each message is ASCII `SEISMO-CARDS-v1` + NUL, ASCII operation + NUL, attempt index as uint32 BE, then block counter as uint32 BE. Both indices start at zero. Each returned block is read in order as eight uint32 BE words.
3. To draw an index in an interval of length m, reject any word at or above `floor(2^32/m) × m`, then return the first eligible word modulo m. This avoids modulo bias conditional on uniform words. The procedure makes no claim about the unpredictability or independence of the physical source.
4. The canonical 52-card order is Diamonds, Hearts, Spades, Clubs; Ace through King in each suit. Fisher–Yates moves i from N−1 down to 1, swapping i with an index in 0…i. The cut moves a prefix of uniformly chosen length in 1…N−1 to the bottom.
5. Move six cards from the head of the queue to its tail, then keep the next card, prepending it to the fan. Repeat twelve times. If the chosen figure and both substitutes are absent, increase the attempt index and start again from the canonical deck. After 16 unsuccessful attempts return `NO_FIGURE`.
6. For a successful attempt, the fan's left-to-right order is the input to the second shuffle and cut. Cut positions and every attempted fan are recorded. Derive the seven stops and all rule IDs from the accepted fan and write out the thematic packets in four contiguous groups. See [METHOD.md](METHOD.md).

There is no independent random input used for cards, even when samples are unavailable. Device time only defines the P4 capture window. The language and animations never enter the computation.

## JSON and independent verification

The JSON contains the exact catalog text, timings, all recorded route states, sample hashes, original P4 calculation, redistribution-permitted miniSEED, the rule-set hash, the preferred and effective figures, every attempt and the output. The `proof_sha256` covers the bundle excluding this field, encoded as UTF‑8 JSON with object members recursively sorted by key in ECMAScript string order. Arrays keep their order. The exact issued `rules.json` UTF-8 text is hashed separately.

The verifier has its own page, accepts JSON and original miniSEED, and never invokes the live collector. It checks the release catalog and rules, route eligibility, evidence hashes, P4 result and a fresh calculation of cards and rules. It distinguishes missing raw recordings, explicit no-data outcomes and inconsistent evidence. The optional grouped re-download uses only matching FDSN routes from this release and checks sample hashes before accepting any recording.

A local browser proof checks agreement with the evidence. Reported receipt times and what was unavailable at the cutoff require an independent observer if externally certified timing is needed. An unavailable or later revised provider recording can keep verification incomplete. The proof digest is neither a signature nor a source of independent randomness.

## Έκδοση απόδειξης v2 (έκδοση εφαρμογής 1.1.0)

Η απόδειξη επιτυχούς ανάγνωσης παίρνει σχήμα `seismo-cards-proof.v2` και πεδίο `narrative` που περιλαμβάνει τη μηχανή, την έκδοση και το SHA‑256 της βάσης γνώσεων, τον κοινό ερμηνευτικό σχεδιασμό και τα παραγόμενα κείμενα EL/EN. Το πεδίο καλύπτεται από το ίδιο αποτύπωμα ολόκληρης απόδειξης. Για αποδείξεις v1 ο verifier συνεχίζει τον αρχικό υπολογισμό. Η ανεπαρκής συλλογή συνεχίζει να δίνει απόδειξη v1 χωρίς φύλλα ή αφήγηση. Βλ. [NARRATIVE.md](NARRATIVE.md).
