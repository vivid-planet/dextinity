---
"@dextinity/cms-api": patch
---

Report invalid block input as validation errors instead of internal errors

- `createBlocksBlock` and `createOneOfBlock`: Report a `blocks` or `attachedBlocks` value that isn't an array with an `isArray` error. Previously, the mutation failed with `value.filter is not a function`. `createListBlock` additionally reports an `isArray` error. All three report an item that is an array with an `isObject` error, which `createListBlock` accepted before and which failed when saving.
- `ChildBlockInput`: Report a missing non-nullable child block with an `isDefined` error. Previously, the mutation failed with `Missing child block input for '<key>'`. Code that calls `blockInputFactory` without validating the result doesn't get this error anymore and must call `validate()` to detect a missing child block. This includes the `openGraphImage` of the SEO block, which was marked as optional although the mutation failed without it.
- `createRichTextBlock`: Add a message to the `isDraftContent` error, which was empty
