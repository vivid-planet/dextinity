---
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: convert custom Draft.js list block types in `migrateFromDraftJs`

The Draft.js migration knew only the built-in `unordered-list-item` and `ordered-list-item`. A custom list block type, for instance a `blocktypeMap` entry with `supportedBy: "unordered-list"`, became a paragraph, and since the migration runs once, the list structure was lost for good.

Map such block types in `listItemMap` to the list they become items of and the list style the item carries:

```ts
const listSizes = { styles: [{ name: "small" }, { name: "large" }] };

createTipTapRichTextBlock({
    unorderedList: listSizes,
    orderedList: listSizes,
    migrateFromDraftJs: {
        listItemMap: {
            "unordered-list-item-small": { list: "unordered", textBlockStyle: "small" },
            "ordered-list-item-small": { list: "ordered", textBlockStyle: "small" },
        },
    },
});
```

Consecutive items of the same list stay one list, whatever their style. An error is thrown at startup when the list is disabled, when `textBlockStyle` isn't one of the list's `styles`, when a block type is also in `textBlockMap`, or when it is one of the built-in list types.
