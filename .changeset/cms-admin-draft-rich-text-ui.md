---
"@dextinity/cms-admin": major
---

Restyle the Draft.js rich text block with the design system of `@dextinity/ui` and deprecate `createRichTextBlock`

The block keeps its options, state and output (`draftContent`). Its editor looks like the fields of `@dextinity/ui` in every color scheme, including dark mode: the frame, focus ring, toolbar, the text type and "More" menus, and the content colors come from the design tokens. The link dialog is a `Dialog` of `@dextinity/ui`.

`createRichTextBlock` is deprecated. Use `createTipTapRichTextBlock` for new rich text blocks.

**Breaking changes**

Inside the block, the editor is restyled through a nested MUI theme. It replaces the theme's `defaultProps` and `styleOverrides` of `DextinityAdminRte`, `DextinityAdminRteToolbar`, `DextinityAdminRteControlButton`, `DextinityAdminRteBlockTypeControls`, `DextinityAdminRteBlockElement`, `MuiMenu`, `MuiMenuItem` and `MuiListItemIcon`, so customizations of these in the project's MUI theme no longer reach the editor of the block. Use the `rte` option of `createRichTextBlock`, e.g. `blocktypeMap` with own `renderConfig` elements, for content styles instead.

The link dialog of the toolbar is no longer an MUI `Dialog`, so MUI theme overrides of `Dialog` don't apply to it.
