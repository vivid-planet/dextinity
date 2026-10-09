---
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: add `createTipTapDefaultTextBlockStyleMigration` and remove `defaultStyle` from the API block

Content written before a `defaultStyle` was configured in the Admin carries no style, so the site would have to render a missing style like the default. Add this migration to the API block's own migrations whenever you add a `defaultStyle`. It gives every text block without a style the style named for its text block, or inside a list item the one passed for its list:

```ts
createTipTapRichTextBlock(
    { textBlocks, orderedList, unorderedList },
    {
        name: "TipTapRichText",
        migrate: {
            version: 1,
            migrations: typeSafeBlockMigrationPipe([
                createTipTapDefaultTextBlockStyleMigration({
                    toVersion: 1,
                    textBlocks: { paragraph: "paragraph300" },
                    orderedList: "list300",
                    unorderedList: "list300",
                }),
            ]),
        },
    },
);
```

The API block no longer accepts `defaultStyle`, since the migration replaces its only use there: the Draft.js migration no longer applies it, and gives a style only where `textBlockMap` or `listItemMap` names one. Remove `defaultStyle` from the API block's options; the Admin block keeps it.
