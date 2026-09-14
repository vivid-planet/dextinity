---
"@dextinity/cms-api": minor
"@dextinity/site-react": patch
"@dextinity/cli": patch
---

Include the link block of rich text blocks in the block meta

The block meta didn't contain the link block used for links in rich text content, so consumers of `block-meta.json` had no way to tell which block the link data inside the rich text content belongs to.

Rich text blocks created with `createRichTextBlock` now use the new `RichTextBlock` field kind (instead of `Json`) for their `draftContent` field, which contains the link block:

```json
{
    "name": "draftContent",
    "kind": "RichTextBlock",
    "nullable": false,
    "linkBlock": "Link"
}
```

Rich text blocks created with `createTipTapRichTextBlock` contain the link block in their existing `TipTapRichTextBlock` field, next to the child blocks. It is omitted when links are disabled:

```json
{
    "name": "tipTapContent",
    "kind": "TipTapRichTextBlock",
    "nullable": false,
    "childBlocks": {},
    "linkBlock": "Link"
}
```
