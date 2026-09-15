---
"@dextinity/cms-admin": minor
---

Add `isTextBlockType` option to `createTipTapRichTextBlock`'s `textBlockStyles`

A text block style with `isTextBlockType: true` shows up as its own entry in the text block type dropdown (alongside "Paragraph"/"Heading N"), instead of in the separate text block style dropdown. This reproduces a single-dropdown UX some legacy Draft.js RTEs had, where a block type like `display` sat above `header-one` — both rendering as `<h1>`, but `display` a distinct, large hero-style variant.

**Example**

```tsx
createTipTapRichTextBlock({
    paragraph: false,
    heading: { levels: [1, 2, 3, 4, 5] },
    textBlockStyles: [
        {
            name: "display",
            label: "Display",
            appliesTo: ["heading-1"],
            isTextBlockType: true,
            element: (props) => <h1 style={{ fontSize: 56 }} {...props} />,
        },
    ],
});
```

The type dropdown becomes _Display, Heading 1, Heading 2, Heading 3, Heading 4, Heading 5_. The plain "Heading 1" entry stays selectable and always means no style — switching to it, or to any other tag, clears the style. Requires `appliesTo` to name exactly one tag, and that tag can't also have a `defaultTextBlockStyles` entry.
