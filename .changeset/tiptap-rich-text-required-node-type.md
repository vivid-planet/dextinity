---
"@dextinity/cli": minor
"@dextinity/cms-admin": minor
---

Export `TipTapNode`/`TipTapMark` from `@dextinity/cli` and use them for `TipTapRichTextBlock`'s output

`generate-block-types` (since `10.3.0`) generates `TipTapNode` for `TipTapRichTextBlock` fields with `type` required, but `createTipTapRichTextBlock`'s `state2Output` returned `@tiptap/core`'s own `JSONContent`, whose `type` is optional. Consumers typing their mutation input against the generated `TipTapNode` could not assign the block's `state2Output` output to it without a manual cast.

`@dextinity/cli` now exports the `TipTapNode`/`TipTapMark` interfaces it already generates into consumer code, and `createTipTapRichTextBlock`'s `state2Output` returns `TipTapNode` instead of `JSONContent`. The block's internal editing state (`TipTapRichTextBlockState`, `TipTapRichTextBlockContent`) is unchanged.
