---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
"@dextinity/site-react": minor
---

Add a `textAlign` option to `createTipTapRichTextBlock`

Editors can align paragraphs and headings left, center, right, or justified, using the toolbar or the shortcuts `Mod-Shift-L`, `Mod-Shift-E`, `Mod-Shift-R`, and `Mod-Shift-J`.
The alignment is stored in the text block's `textAlign` attribute.
The option is disabled by default and must be enabled in both the API and the Admin:

```ts
createTipTapRichTextBlock({ textAlign: true });
```

`renderTipTapRichText` renders the alignment as the text block's `text-align` style.
A custom `textBlock` handler has to apply `node.attrs.textAlign` itself.
