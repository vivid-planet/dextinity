---
"@dextinity/cms-api": patch
---

Fix `TableBlock` running the migrations of its cells again when saving

This could break saving a cell, for instance, when the cell contains a link block with migrations.
