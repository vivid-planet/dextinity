---
"@dextinity/cms-api": patch
---

Add indexes for the DAM foreign keys `DamFile.copyOf`, `DamMediaAlternative.for` and `DamMediaAlternative.alternative`

Without these indexes Postgres has to sequentially scan `DamFile` and `DamMediaAlternative` for every referenced row, which makes bulk DAM operations (copying, moving or deleting many files) very slow. A migration creates the missing indexes.
