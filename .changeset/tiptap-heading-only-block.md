---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Support heading-only TipTap rich text blocks

`paragraph` is now a feature of `createTipTapRichTextBlock` like the other text block types, enabled by default. Turning it off results in a heading-only block (e.g. a headline): the text block type select only offers headings, the editor starts with a heading instead of a paragraph, and content containing a paragraph is rejected during validation.

The `heading` options gain a `defaultLevel`, the level a newly created heading gets. It defaults to the lowest allowed level and must be one of them. `migrateFromDraftJs` uses it for Draft.js blocks that don't carry a heading level, so migrated content doesn't fall back to paragraphs the schema doesn't allow.

**Example**

A headline block that only offers H2-H4 and starts with an H3:

```tsx
createTipTapRichTextBlock({
    paragraph: false,
    heading: { levels: [2, 3, 4], defaultLevel: 3 },
    maxTextBlocks: 1,
});
```

Lists are disabled in a heading-only block, because a list item's content starts with a paragraph. Enabling one explicitly throws, as does turning off `paragraph` and `heading` together, which would leave no text block type at all.
