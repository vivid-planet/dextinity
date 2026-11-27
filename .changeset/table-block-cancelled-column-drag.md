---
"@dextinity/cms-admin": patch
---

Keep the column order of a `TableBlock` when a column is dragged and dropped outside the table

Before, the column was saved at the position it had when it left the table, although the table still showed it at its original position.
