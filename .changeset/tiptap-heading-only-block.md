---
"@dextinity/cms-admin": minor
---

Support heading-only TipTap rich text blocks via the new `allowParagraph` and `defaultHeadingLevel` options

`createTipTapRichTextBlock` accepts two new options:

- `allowParagraph?: boolean` (defaults to `true`) — set to `false` for a block without paragraphs, for instance a headline. The text block type select then only offers headings and the editor starts with a heading instead of a paragraph. Requires `heading` in `supports` and cannot be combined with list support, because a list item's content starts with a paragraph.
- `defaultHeadingLevel?: number` — the heading level of newly created headings. Defaults to the lowest level in `headingLevels` and must be one of them.

**Example**

A headline block that only offers H2-H4 and starts with an H3:

```tsx
createTipTapRichTextBlock({
    supports: ["heading", "bold", "italic"],
    headingLevels: [2, 3, 4],
    defaultHeadingLevel: 3,
    allowParagraph: false,
    maxTextBlocks: 1,
});
```
