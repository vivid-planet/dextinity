---
"@dextinity/cms-api": minor
---

Support heading-only TipTap rich text blocks via the new `allowParagraph` and `defaultHeadingLevel` options

`createTipTapRichTextBlock` accepts two new options, mirroring the ones added to `@dextinity/cms-admin`:

- `allowParagraph?: boolean` (defaults to `true`) — set to `false` for a block without paragraphs, for instance a headline. Content containing a paragraph is rejected during validation. Requires `heading` in `supports` and cannot be combined with list support, because a list item's content starts with a paragraph.
- `defaultHeadingLevel?: number` — the heading level used for headings that don't specify one. Defaults to the lowest level in `headingLevels` and must be one of them. `migrateFromDraftJs` uses it for Draft.js blocks that don't carry a heading level, so migrated content doesn't fall back to paragraphs the schema doesn't allow.

**Example**

A headline block that only allows H2-H4:

```ts
createTipTapRichTextBlock({
    supports: ["heading", "bold", "italic"],
    headingLevels: [2, 3, 4],
    defaultHeadingLevel: 3,
    allowParagraph: false,
    maxTextBlocks: 1,
});
```
