# HCKE και σεισμολογική συνδεσιμότητα / HCKE and seismic collection

## Ιστορικός κορμός και σύνθεση

- Το ανεξάρτητο **docs/historical/knowledge.json** διατηρήθηκε byte-for-byte από την προετοιμασία. Περιλαμβάνει 1.326 ιστορικές καταχωρίσεις και 39 συμπληρωματικές μαρτυρίες.
- Ο ενεργός κατάλογος της 2.0.0 έχει 164 ενεργοποιήσεις του 770, επιβεβαιωτικές μαρτυρίες, 43 υποψήφιες εξειδικεύσεις και 13 συνθετικές ιδέες D/E. Το κοινό σχέδιο HCKE καταγράφει στάσεις, κεντρικά φύλλα, γείτονες, πακέτα, επαναλήψεις, αντιφάσεις, μετριασμό του A♣ και τεκμήρια.
- Κάθε φυσική συνάντηση μετρά μία φορά. Τα P24 και P37 διατηρούν χωριστές εκβάσεις. Ο A♣ μετριάζει μόνο τον δυσμενή άμεσο γείτονα στην αφήγηση. Ορισμένες ειδικές εξειδικεύσεις παραμένουν διαθέσιμες ως τεκμήρια όταν δεν υπάρχει επαρκές συμφραζόμενο, όπως για πλωτό ταξίδι ή για επένδυση.
- Το θέμα αλλάζει τη σειρά παρουσίασης των ήδη ενεργών ενδείξεων. EL και EN παράγονται τοπικά από κοινό σχέδιο και τοπικούς κανόνες. Οι ιστορικές ερμηνείες έχουν δική τους προβολή και οι εκδοτικές συνθέσεις φέρουν σαφή σήμανση ψυχαγωγίας.
- Ο verifier υποστηρίζει τα σχήματα seismo-cards-proof.v1, v2 και v3. Κρατά τον ακριβή κατάλογο της προγενέστερης έκδοσης. Για τη 2.0.0 ελέγχει το P4, το μοίρασμα, το θέμα, το αποτύπωμα του HCKE και τις δύο γλώσσες. Όταν λείπει ακριβής έκδοση HCKE, εμφανίζει χωριστά την κατάσταση των καρτών και της αφήγησης. Το SHA-256 είναι έλεγχος ακεραιότητας και δεν πιστοποιεί εξωτερική ώρα ή υπογραφή δημιουργού.

## Συλλογή από τη SEISMO 1.1.1

Ο παραγωγικός συλλέκτης και ο κατάλογος προέρχονται από το συνημμένο SEISMO 1.1.1. Οι πρώτοι πάροχοι καλύπτουν ελληνικούς σταθμούς HL/HT μέσω EarthScope και CL μέσω EPOS France. Η θέση του οργάνου, ο δημοσιευμένος αριθμός προτεραιότητας και η φυσική ταυτότητα του σταθμού καθορίζουν τη σειρά. Η συλλογή χρησιμοποιεί παράλληλα αιτήματα με ομαδοποίηση ανά πάροχο και επίπεδο. Ισχύουν παράθυρα 1/3/5/10 s από το πρώτο επόμενο όριο 10 ms UTC, χρονικά όρια και πάγωμα 2 s πριν τη λήξη. Ελέγχονται κάλυψη, κανάλι, ρυθμός, άφιξη πριν από το πάγωμα και αποτυπώματα. Σε 204/404 το αίτημα δεν παρέχει δείγματα. Σε 503/429 τηρείται ο χρόνος επανάληψης. Οι 330 s ενεργοποιούν το επίπεδο 5 και τις επιτρεπόμενες συνδέσεις SeedLink. Σε ανεπαρκή πλήρη δείγματα ο γύρος δεν παράγει φύλλα. Το method.js και τα κανονικά bytes εισόδου SHA-256 διατηρήθηκαν.

[SEISMO v1.1.1](https://github.com/dosgr/SEISMO/releases/tag/v1.1.1) · [EarthScope FDSN Dataselect](https://service.earthscope.org/fdsnws/dataselect/1/) · [EPOS France CL](https://doi.org/10.15778/RESIF.CL)

## English

Release 2.0.0 preserves the published card procedure and the preparation archive. HCKE builds one semantic plan over the exact issue 770 trace and realises both languages locally. Historical witnesses supply provenance. Editorial refinements must have explicit support in the same reading. Selecting a theme changes presentation. Optional support has no pathway into collection, cards or narrative. The versioned v3 proof can be replayed independently and the pinned legacy catalogue supports 1.1.0 evidence.

The collector uses EarthScope Greek HL/HT, EPOS France Greek CL and the international backup tiers from the supplied SEISMO release. It requires complete and valid exact-window samples from three distinct physical sites. International providers supplement insufficient Greek coverage, with a dedicated extended round for the slower routes.


## Συμβατότητα αποδείξεων / Proof compatibility

Το αναγνωριστικό μηχανής `hcke.2.0.0-beta.1` είναι μέρος του υπολογισμού και παραμένει σταθερό ώστε οι αποδείξεις v3 της εγκεκριμένης δοκιμής να επαληθεύονται αυτούσιες στην επίσημη 2.0.0.

The engine identifier `hcke.2.0.0-beta.1` is part of the deterministic calculation. Release 2.0.0 preserves it so existing v3 proofs from the approved beta replay exactly.
