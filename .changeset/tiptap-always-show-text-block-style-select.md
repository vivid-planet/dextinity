---
"@dextinity/cms-admin": minor
---

Add `alwaysShowTextBlockStyleSelect` option to `createTipTapRichTextBlock`

By default, the toolbar hides the text block style select where the selected node has no styles, for instance in a list without styles, and the toolbar buttons to its right move to the left.
With `alwaysShowTextBlockStyleSelect: true`, the select stays in the toolbar and is disabled there instead:

```tsx
const RichTextBlock = createTipTapRichTextBlock({
    alwaysShowTextBlockStyleSelect: true,
    textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p", styles: [introStyle] }],
});
```
