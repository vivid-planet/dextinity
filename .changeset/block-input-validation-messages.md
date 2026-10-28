---
"@dextinity/cms-api": patch
---

Describe how to fix a missing child block and an empty one-of block in their validation messages

The message of a missing child block names the expected block and its fields, for instance `space is missing. Expected a Space block with the fields height (a number), size (one of: small, large).`
The message of an empty one-of block that doesn't allow empty explains `attachedBlocks` and `activeType`.
