---
"@dextinity/cms-api": patch
---

Reject unknown block types in the input of `createBlocksBlock` and `createOneOfBlock`

Previously, an item with a `type` that isn't in `supportedBlocks` was removed from `blocks` or `attachedBlocks` before validation, and the mutation saved the block without it.
Now, such an input fails validation with an `isIn` error at the `type` of the item, for instance `blocks.1.type`.
The index in the error path is the index of the item in the input.
Code that calls `blockInputFactory` without validating the result keeps such an item now, and `transformToBlockData()` throws for it. Call `validate()` to detect it.

The Admin only sends supported block types and isn't affected.
Stored block data with unknown types is still filtered when loaded, as a block may have been removed from `supportedBlocks` since the data was saved.
