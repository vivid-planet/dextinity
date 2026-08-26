---
"@dextinity/cms-api": minor
---

Support heading-only TipTap rich text blocks

`paragraph` is now a text block type in `supports`, next to `heading`, `ordered-list` and `unordered-list`, mirroring the change in `@dextinity/cms-admin`. Leaving it out results in a heading-only block (e.g. a headline), and content containing a paragraph is rejected during validation.

`createTipTapRichTextBlock` also accepts a new `defaultHeadingLevel?: number` option, the heading level used for headings that don't specify one. It defaults to the lowest level in `headingLevels` and must be one of them. `migrateFromDraftJs` uses it for Draft.js blocks that don't carry a heading level, so migrated content doesn't fall back to paragraphs the schema doesn't allow.

**Example**

A headline block that only allows H2-H4:

```ts
createTipTapRichTextBlock({
    supports: ["heading", "bold", "italic"],
    headingLevels: [2, 3, 4],
    defaultHeadingLevel: 3,
    maxTextBlocks: 1,
});
```

**Breaking change**

Blocks that pass `supports` need `paragraph` added to keep their paragraphs — without it, stored paragraph content no longer passes validation:

```diff
 createTipTapRichTextBlock({
-    supports: ["bold", "italic"],
+    supports: ["paragraph", "bold", "italic"],
 });
```

`supports` must contain at least one text block type (`paragraph` or `heading`), and list support requires `paragraph`, because a list item's content starts with a paragraph. Both are checked when the block is created. Blocks that don't pass `supports` are unaffected, `paragraph` is part of the default.
