---
"@dextinity/cms-admin": minor
---

Allow any block as the cell block of `createTableBlock`

The cell block no longer needs a `ReadOnlyComponent`. A cell block without it, for instance a `OneOfBlock` of rich text and `DamImageBlock`, is shown in the table through its preview content, so cells can contain media.

```tsx
const TableCellBlock = createOneOfBlock({
    supportedBlocks: { richText: RichTextBlock, image: DamImageBlock },
    name: "TableCell",
    allowEmpty: false,
});

const TableBlock = createTableBlock({ richText: TableCellBlock });
```
