---
"@dextinity/cms-admin": minor
---

Show an icon and a description for each block in the Add Block Drawer

Blocks get two optional fields: `iconName`, an icon of `@dextinity/ui`, and `description`, a few words on what the block is for.
The drawer shows them for each block type and also finds blocks by their description; a block list shows the `iconName` for blocks whose `icon` returns none.
Without them, a block shows an icon for its category.
`createCompositeBlock`, `createOneOfBlock`, `createListBlock`, `createColumnsBlock` and `createLinkBlock` accept both as options; all blocks of `@dextinity/cms-admin` set them.

```tsx
export const QuoteBlock = createCompositeBlock({
    name: "Quote",
    displayName: <FormattedMessage id="quoteBlock.displayName" defaultMessage="Quote" />,
    category: BlockCategory.TextAndContent,
    iconName: "chats",
    description: <FormattedMessage id="quoteBlock.description" defaultMessage="Quotation with its author" />,
    blocks: {
        // …
    },
});
```

The drawer also tells where the new block will be inserted and no longer shows category filter chips: the blocks stay grouped under their category headings, and the search finds blocks across all categories.
