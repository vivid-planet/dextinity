---
"@dextinity/cms-admin": major
---

Build the toolbar and dialogs of the TipTap rich text block with `@dextinity/ui`

The block keeps its options, state and output. The editor sits in the frame of a `@dextinity/ui` field with its focus ring, and its content uses the typography of the design system.

- The toolbar is a `Toolbar` of `@dextinity/ui`: its buttons show their keyboard shortcuts in their tooltips, and the text type, the text style, "More options", the placeholders and the child blocks are menus.
- The link, child block and translation dialogs are `Dialog`s of `@dextinity/ui`.
- Placeholders and child blocks in the text are shown in the colors of the design system. A child block opens its dialog with the keyboard too.

**Breaking changes**

The `icon` of an inline style is a React node now, e.g. an `Icon` of `@dextinity/ui`, instead of an MUI icon component:

```diff
 createTipTapRichTextBlock({
     inlineStyles: [
         {
             name: "highlight",
             label: <FormattedMessage id="tipTapRichTextBlock.inlineStyle.highlight" defaultMessage="Highlight" />,
-            icon: RteHighlight,
+            icon: <Icon name="rte-highlight" />,
             element: (props) => <span className="highlight" {...props} />,
         },
     ],
 });
```

The toolbar no longer has the class `DextinityAdminTipTapToolbar-root`. Select it by its role instead, e.g. `[role="toolbar"]`.

The menus show the text of `label`s that are strings, numbers or `FormattedMessage`s, and the `name` for any other label of a text block, text style, inline style or placeholder.
