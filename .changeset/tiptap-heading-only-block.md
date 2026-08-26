---
"@dextinity/cms-admin": minor
---

Support heading-only TipTap rich text blocks

`paragraph` is now a text block type in `supports`, next to `heading`, `ordered-list` and `unordered-list`. Leaving it out results in a heading-only block (e.g. a headline): the text block type select only offers headings and the editor starts with a heading instead of a paragraph.

`createTipTapRichTextBlock` also accepts a new `defaultHeadingLevel?: number` option, the heading level of newly created headings. It defaults to the lowest level in `headingLevels` and must be one of them.

**Example**

A headline block that only offers H2-H4 and starts with an H3:

```tsx
createTipTapRichTextBlock({
    supports: ["heading", "bold", "italic"],
    headingLevels: [2, 3, 4],
    defaultHeadingLevel: 3,
    maxTextBlocks: 1,
});
```

**Breaking change**

Blocks that pass `supports` need `paragraph` added to keep their paragraphs — without it, existing paragraph content is no longer valid:

```diff
 createTipTapRichTextBlock({
-    supports: ["bold", "italic"],
+    supports: ["paragraph", "bold", "italic"],
 });
```

`supports` must contain at least one text block type (`paragraph` or `heading`), and list support requires `paragraph`, because a list item's content starts with a paragraph. Both are checked when the block is created. Blocks that don't pass `supports` are unaffected, `paragraph` is part of the default.
