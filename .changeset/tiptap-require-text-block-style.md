---
"@dextinity/cms-admin": minor
---

Add `requireTextBlockStyle` option to `createTipTapRichTextBlock`

When `textBlockStyles` are configured, the toolbar's style dropdown always offered an unstyled "Default" entry in addition to the configured styles. Passing `requireTextBlockStyle: true` removes that entry for headings and paragraphs that have at least one applicable style: the editor auto-assigns the first applicable style instead of leaving it unset.

```ts
createTipTapRichTextBlock({
    textBlockStyles: [{ name: "large", label: "Large", element: LargeText }],
    requireTextBlockStyle: true,
});
```
