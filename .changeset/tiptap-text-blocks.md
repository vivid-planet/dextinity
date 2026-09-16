---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: replace the `paragraph` and `heading` options with `textBlocks`

The text block types the content may consist of are now configured explicitly, which decouples a text block from the heading level it is stored as and lets several text blocks share a tag (e.g. an eyebrow next to a regular paragraph). Each text block defines the `styles` it offers and the `defaultStyle` new text blocks of its type get, so a style no longer needs `appliesTo`. Text blocks that offer the same style share its definition.

**Example**

```tsx
const headlineStyles = [
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
            defaultStyle: "copy200",
        },
        { name: "heading-1", label: "Heading 1", tag: "h1", styles: headlineStyles, defaultStyle: "headline300" },
        { name: "heading-2", label: "Heading 2", tag: "h2", styles: headlineStyles, defaultStyle: "headline400" },
    ],
});
```

**Migrating an existing configuration**

- `paragraph`/`heading` → a `textBlocks` entry per text block type (`tag: "p"` for the paragraph, `h1`-`h6` for the headings). It defaults to a paragraph plus a heading for every level, so only a restricted set needs to be configured. Leaving the paragraph out replaces `paragraph: false`.
- `heading: { defaultLevel }` → `defaultTextBlock`, which names the text block new content starts with (defaults to the first one).
- `textBlockStyles` and a text block style's `appliesTo` → the `styles` of the text blocks that offer the style. Lists take their styles the same way: `orderedList`/`unorderedList` accept `{ styles, defaultStyle }` instead of `true`.
- An inline style's `appliesTo` now lists text block names (plus `ordered-list`/`unordered-list`) instead of text block types.
- In the Admin, a text block style's `element` receives the tag of the text block it is applied to, so one style can be shared: `element: (props, Tag) => <Tag {...props} />`.

A paragraph/heading node now stores the text block it belongs to in its `textBlock` attribute, next to the existing `textBlockStyle`. Content written before this change keeps working: a node without a `textBlock` falls back to the first text block with a matching tag.
