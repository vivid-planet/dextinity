---
"@dextinity/cms-admin": minor
---

Add `icon` option to `TipTapInlineStyle`

Custom inline styles shown in the rich text toolbar's "More options" menu can now specify an `icon`, displayed next to the label the same way Superscript/Subscript already are:

```tsx
createTipTapRichTextBlock({
    inlineStyles: [
        {
            name: "highlight",
            label: <FormattedMessage id="..." defaultMessage="Highlight" />,
            icon: RteHighlight,
            element: (props) => <span style={{ backgroundColor: "#fff3cd" }} {...props} />,
        },
    ],
});
```

`icon` is optional; menu items without one keep rendering as before.
