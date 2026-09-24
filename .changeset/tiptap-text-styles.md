---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: add `styles` to text blocks and lists

A text block's tag carries its semantics, but a design usually offers several looks for the same tag — a small copy paragraph next to a regular one. Adding a text block per look makes the type select long and mixes the two decisions. `styles` keeps them apart: the editor picks a text block type _and_ a style, offered in a second toolbar select next to the type select.

The chosen style is stored in the node's `textStyle` attribute. A style a node isn't configured for is rejected during validation, so the `styles` have to match between the API and the Admin.

**Example**

```tsx
const copyStyles: TipTapTextBlockStyle[] = [
    { name: "copy300", label: "Copy", element: (props, Tag) => <Tag className={styles.copy300} {...props} /> },
    { name: "copy200", label: "Copy Small", element: (props, Tag) => <Tag className={styles.copy200} {...props} /> },
];

const headlineStyles: TipTapTextBlockStyle[] = [
    { name: "headline450", label: "Headline 450", element: (props, Tag) => <Tag className={styles.headline450} {...props} /> },
    { name: "headline300", label: "Headline 300", element: (props, Tag) => <Tag className={styles.headline300} {...props} /> },
];

createTipTapRichTextBlock({
    textBlocks: [
        { name: "paragraph", tag: "p", label: "Paragraph", styles: copyStyles },
        { name: "heading-1", tag: "h1", label: "Heading 1", styles: headlineStyles },
        { name: "heading-2", tag: "h2", label: "Heading 2", styles: headlineStyles },
        // A text block can render its own element without offering styles.
        { name: "display", tag: "h1", label: "Display", element: (props, Tag) => <Tag className={styles.display} {...props} /> },
    ],
    orderedList: { styles: copyStyles },
});
```

The API takes the same option with the `name` only.

`element` previews the style in the editor. It is handed the tag its text block is stored as, so one style set can serve several text blocks: a headline style shared by heading 1 and heading 2 renders an `<h1>` for one and an `<h2>` for the other.

**Lists**

`orderedList` and `unorderedList` take `{ styles }` in place of `true`. A list's style sits on the list node, so all of its items share it, and a nested list carries its own — the select always addresses the innermost list the cursor is in. A list item's own text block never carries a `textStyle`.

**On the site**

Resolve `textStyle` to your own typography, and read a list item's style from the list it is rendered in, which `renderTipTapRichText` hands to every handler as `parent`:

```tsx
const nodeMapping: Record<string, TipTapNodeHandler> = {
    textBlock: ({ node, children }) => <Typography variant={node.attrs?.textStyle ?? node.attrs?.textBlock}>{children}</Typography>,
    listItem: ({ parent, children }) => (
        <Typography as="li" variant={parent?.attrs?.textStyle}>
            {children}
        </Typography>
    ),
};
```

`migrateFromDraftJs`' `textBlockMap` takes a `textStyle` alongside the `textBlock`, so a Draft.js `blocktypeMap` entry can become a text block with a style applied.
