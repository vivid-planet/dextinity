---
"@dextinity/cms-api": minor
---

Add the TipTap editor schema of a `TipTapRichTextBlock` field to the block meta

The field's entry in `block-meta.json` now carries a `tipTap` description next to `childBlocks`: the node and mark types of the editor schema, the text blocks with their styles, the default text block, the ordered and unordered list (`null` when disabled), the inline styles, the placeholders, the link block (`null` when links are disabled), `maxTextBlocks` and `listLevelMax`.
This allows tools outside the editor, for instance an AI agent, to build content the API accepts instead of falling back to TipTap's defaults.
The block's default description explains how to build content from it.
