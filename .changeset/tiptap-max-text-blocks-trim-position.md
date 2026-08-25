---
"@dextinity/cms-admin": patch
---

Fix a `RangeError` when trimming excess text blocks in the TipTap rich text editor

`maxTextBlocks`'s trim-on-paste logic computed the deletion range with an extra `+1` offset, on the assumption that `doc` content positions start after an opening token like other nodes. `doc` has no such token — its content starts at position 0 — so the offset pointed past the end of the document, most reliably reproducible with `maxTextBlocks: 1`.
