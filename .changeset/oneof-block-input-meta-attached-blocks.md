---
"@dextinity/cms-api": patch
---

Include `attachedBlocks` in the input fields of the block meta of one-of blocks

The block meta of blocks created with `createOneOfBlock` (and `createLinkBlock`) was missing the `attachedBlocks` field in `inputFields`, causing the generated block input types to only contain `activeType`.
