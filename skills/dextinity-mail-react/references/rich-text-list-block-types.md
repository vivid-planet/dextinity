# Rich-text list block types

A list in a second text variant needs a custom block type, for example `unordered-list-item-small`. Register it in the admin RTE and in the mail block.

## 1. Admin RTE

Add the block type to `rte.blocktypeMap` on the CMS `createRichTextBlock`. For the surrounding options, see the `dextinity-block` skill's [rich-text reference](../../dextinity-block/references/rich-text.md).

```tsx
blocktypeMap: {
    "unordered-list-item": {
        label: <FormattedMessage id="…" defaultMessage="Unordered List (Default)" />,
        group: "dropdown",
    },
    "unordered-list-item-small": {
        label: <FormattedMessage id="…" defaultMessage="Unordered List (Small)" />,
        renderConfig: { wrapper: <Typography variant="body2" component="ul" className="public-DraftStyleDefault-ul" />, element: "li" },
    },
    "ordered-list-item": {
        label: <FormattedMessage id="…" defaultMessage="Ordered List (Default)" />,
        group: "dropdown",
    },
    "ordered-list-item-small": {
        label: <FormattedMessage id="…" defaultMessage="Ordered List (Small)" />,
        renderConfig: { wrapper: <Typography variant="body2" component="ol" className="public-DraftStyleDefault-ol" />, element: "li" },
    },
},
```

- Set `group: "dropdown"` on `unordered-list-item` and `ordered-list-item`. This moves the two built-in toolbar buttons into the block-type select, beside the custom list types. The toolbar keeps no list button.
- Give each label the list kind and the variant, such as `Ordered List (Default)`. A label that only names the variant hides the kind of list.
- Keep `unordered-list` and `ordered-list` in `supports`. The select hides a built-in list type without them.
- Give each block type its own `wrapper` element. Draft-js merges a run of blocks into one list when two block types share one element.
- Make the `wrapper` a `Typography` with the admin theme variant closest to the mail variant. Set `component` to `ul` or `ol`. Every list looks the same in the editor without it, and the `<li>` elements inherit the styles.
- Keep the `public-DraftStyleDefault-ul` or `-ol` class on the `wrapper`. It removes the browser's list padding, which draft-js adds again on each `<li>` for the nesting level.
- Set `element` to the plain string `"li"`. A component in its place loses draft-js's list styling.
- Do not set `supportedBy` on a custom block type. Its values are a closed union, and a block type without it is always available.

## 2. Mail block

Map the same names in `createRichTextBlock`, each with its list kind and a theme text variant:

```tsx
const { MjmlRichTextBlock } = createRichTextBlock({
    blockTypes: {
        "unordered-list-item": { variant: "copy" },
        "ordered-list-item": { variant: "copy" },
        "unordered-list-item-small": { variant: "copySmall", list: "unordered" },
        "ordered-list-item-small": { variant: "copySmall", list: "ordered" },
    },
});
```

The variant must exist in `text.variants` and in the `TextVariants` module augmentation. `unordered-list-item` and `ordered-list-item` take no `list`.

## Spacing per variant

`theme.list` applies to every list. For one variant, scope a rule to that variant's modifier on the list table:

```tsx
registerStyles(
    css`
        .richTextBlock__list--variantCopySmall .richTextBlock__listItem--itemSpacing > td {
            padding-bottom: 4px !important;
        }

        .richTextBlock__list--variantCopySmall .richTextBlock__listItemMarker {
            padding-right: 8px !important;
        }
    `,
    { inline: true },
);
```

- A row with `richTextBlock__listItem--itemSpacing` carries `list.itemSpacing` as `padding-bottom` on both of its cells. Target `> td` to keep the marker level with the text. The last row of a list carries no such class, so the spacing below the list stays with the theme.
- The marker cell carries `list.markerGap` as `padding-right`, and `list.indent` as `padding-left`.
- `{ inline: true }` writes the declaration into each cell's `style` attribute at compile time, which Outlook needs. Every rule needs `!important`, because the cells carry their own spacing inline.

## Limits

- An editor cannot indent a custom list block type. Draft-js and the RTE's indent controls handle `unordered-list-item` and `ordered-list-item` only.
- A nested level takes the font styles of the list that contains it. It cannot have its own variant.
- A custom ordered list uses the browser's `<ol>` numbering in the editor, not draft-js's counters.
