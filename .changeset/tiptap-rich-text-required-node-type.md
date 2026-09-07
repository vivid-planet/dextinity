---
"@dextinity/cms-admin": minor
---

Type `TipTapRichTextBlock`'s `state2Output` output with a `type: string` required on every node

`generate-block-types` (since `10.3.0`) generates `TipTapNode` for `TipTapRichTextBlock` fields with `type` required, but `createTipTapRichTextBlock`'s `state2Output` returned `@tiptap/core`'s own `JSONContent`, which types `type` as optional. Consumers typing their mutation input against the generated `TipTapNode` could not assign the block's `state2Output` output to it without a manual cast.

`state2Output` now returns the new `TipTapRichTextBlockOutputNode` type (also exported, together with `TipTapRichTextBlockOutputMark`), which requires `type: string` on every node, matching the shape `generate-block-types` emits. The block's internal editing state (`TipTapRichTextBlockState`, `TipTapRichTextBlockContent`) is unchanged.
