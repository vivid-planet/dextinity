---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: define text block styles inside the text blocks

A text block style had to be configured in two places: globally in `textBlockStyles`, and again through an `appliesTo` listing the text block types it was allowed for. Reading what a text block offers meant scanning every style's `appliesTo`.

A text block now carries its style definitions directly, and `textBlockStyles` is gone. Text blocks that offer the same style share its definition, which makes the shared set explicit instead of implying it through repeated names.

**Example**

```tsx
const headlineStyles: TipTapTextBlockStyle[] = [
    { name: "headline300", label: "Headline 300", element: (props, Tag) => <Tag {...props} /> },
    { name: "headline400", label: "Headline 400", element: (props, Tag) => <Tag {...props} /> },
];

createTipTapRichTextBlock({
    textBlocks: [
        {
            name: "paragraph",
            label: "Paragraph",
            tag: "p",
            styles: [
                { name: "copy100", label: "Copy 100", element: (props, Tag) => <Tag {...props} /> },
                { name: "copy200", label: "Copy 200", element: (props, Tag) => <Tag {...props} /> },
            ],
        },
        { name: "heading-1", label: "Heading 1", tag: "h1", styles: headlineStyles },
        { name: "heading-2", label: "Heading 2", tag: "h2", styles: headlineStyles },
    ],
});
```

In the API the styles are `{ name }` objects, mirroring the Admin configuration without the labels and elements.

A text block that needs no style choice carries its own `element` instead of `styles`. The two exclude each other, so a text block offers a style choice or renders one way, never both:

```tsx
createTipTapRichTextBlock({
    textBlocks: [{ name: "display", label: "Display", tag: "h1", element: (props, Tag) => <Tag style={{ fontSize: 64 }} {...props} /> }],
});
```

**Migrating an existing configuration**

- `textBlockStyles` and a style's `appliesTo` → the `styles` of the text blocks that offer the style.
- `appliesTo: ["ordered-list", "unordered-list"]` → `orderedList`/`unorderedList` accept `{ styles }` instead of `true`.
- An inline style's `appliesTo` now lists text block names (plus `ordered-list`/`unordered-list`) instead of text block types.
- In the Admin, a style's `element` receives the tag of the text block it is applied to, so one style can be shared: `element: (props, Tag) => <Tag {...props} />`.

A style's `name` still identifies it in the content's `textBlockStyle` attribute, so the stored content format is unchanged.
