# Αφηγηματική σύνθεση / Narrative synthesis

**Μηχανή** `seismo-nlg.v1` · **Βάση γνώσεων** `thesavros-narrative-2026.11`.

## Από τη βεντάλια στο κείμενο

1. Τα 52 φύλλα, οι 72 εγγραφές ζευγών και οι 39 εγγραφές ομοίων διατηρούν την ταυτότητά τους από το `rules.json`. Η βάση `knowledge.json` συνδέει καθεμία με θέμα και τόνο. Για κάθε φύλλο υπάρχει προσωπική διατύπωση και εναλλακτική παραγωγή από το ιστορικό νόημα.
2. Η μηχανή συγκεντρώνει τις πραγματικές ενδείξεις από στάσεις, ζεύγη, αξίες, τον κανόνα του Άσου σπαθί και θεματικά πακέτα. Κάθε μοναδικός κανόνας κρατά τα φύλλα και όλες τις θέσεις που τον ενεργοποίησαν. Η συσσώρευση θέσεων αυξάνει περιορισμένα το βάρος, χωρίς να διπλασιάζει το κείμενο.
3. Οι θεματικές βαθμολογούνται με βάρη 5 για ζεύγη, 4 για όμοια, 2 για ατομική ένδειξη ή τον Άσο σπαθί, συν έως 2 για επανάληψη. Η ισοβαθμία λύνεται λεξικογραφικά κατά κωδικό θέματος. Η σύνθεση κρατά έως τέσσερα θέματα ή έως πέντε όταν υπάρχουν πάνω από έξι. Όταν συνυπάρχουν ευνοϊκά και δυσμενή σημάδια στο ίδιο θέμα, η δεύτερη ένδειξη επιλέγεται κατά προτεραιότητα από τον αντίθετο τόνο. Οι δύο εγγραφές για Ντάμα και Άσο κούπα διατηρούνται στα τεκμηριωμένα σήματα και στην αναλυτική ανάγνωση.
4. Οι τέσσερις τριάδες δίνουν δικά τους συμφραζόμενα. Προτιμώνται φύλλα που δεν έχουν χρησιμοποιηθεί στη βασική ανάπτυξη. Όπου έχουν ήδη αναπτυχθεί όλα, η παράγραφος παραπέμπει στο αντίστοιχο νήμα. Το κλείσιμο προκύπτει από τους πραγματικούς τόνους του συνόλου.
5. Οι επιπλέον πηγές εμφανίζονται όταν τα σχετικά φύλλα υπάρχουν. Οι συγκρίσεις δύο φύλλων απαιτούν κυκλική γειτνίαση. Οι σημειώσεις δηλώνουν ρητά συγγενική ή διαφορετική ανάγνωση και συνδέονται με την πηγή τους. Η ιστορική σύνθεση κρίνεται με τα δεδομένα του Θησαυρού.

## Reproducibility

Both languages are realized from the same plan. The wording choice uses a stable integer hash of the existing P4 fingerprint and a template key. It never calls the shuffle or any independent random input. The v2 proof contains the plan with signal IDs, engine and corpus versions, exact corpus SHA‑256, and both texts. The existing SHA‑256 envelope covers the whole proof. The verifier derives the cards first, rebuilds the plan and both languages, and compares the result. Existing v1 proofs retain their original interpretation transcript. Unsuccessful rounds have no narrative.

See [RESEARCH.md](RESEARCH.md) for the comparative layer and [EXAMPLES.md](EXAMPLES.md) for sample outputs rendered with the actual engine.
