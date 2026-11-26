---
"@dextinity/cms-admin": minor
---

Add the `convertCell` option to `createTableBlock`

It converts a cell's content when an editor changes the cell's type, for instance from a text to a price cell.
Return `null` when the content can't be converted.
A conversion takes precedence over the content the cell had in the new type before.

**Example**

```tsx
const TableBlock = createTableBlock({
    name: "Table",
    cellBlocks: { text: TextCellBlock, price: PriceCellBlock },
    convertCell: {
        price: {
            text: ({ amount }) => ({ text: String(amount) }),
        },
    },
});
```
