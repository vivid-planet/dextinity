---
"@dextinity/cms-admin": major
---

Use `TipTapRichTextEditor` from `@dextinity/admin` as the editor of `createTipTapRichTextBlock`

The toolbar's class name changes, so update styles that target it:

```diff
- .DextinityAdminTipTapToolbar-root {
+ .DextinityAdminTipTapRichTextEditor-toolbar {
```

`DextinityAdminTipTapRichTextEditor` and `DextinityAdminTipTapRichTextEditorToolbarButton` in the theme apply to the block's editor, so it can also be restyled with `styleOverrides`.

The editor's messages move from `dextinity.blocks.tipTapRichText.*` to `dextinity.tipTapRichTextEditor.*`, for instance `dextinity.tipTapRichTextEditor.bold.tooltip`. Rename them where your project overrides them. The messages of the block itself, such as `dextinity.blocks.tipTapRichText.insertBlock`, keep their IDs.
