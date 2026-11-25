---
"@dextinity/cms-admin": minor
---

Add the `getCellStyle` option to `createTableBlock`

It styles a cell in the admin grid depending on the settings of its row and column, so that editors see the effect of a setting while editing the table, for example a dimmed row.
The styles take precedence over the default styles of the cell.

**Example**

```tsx
const TableBlock = createTableBlock({
    name: "Table",
    richText: RichTextBlock,
    rowSettings: createTableSettings({
        soldOut: {
            type: "checkbox",
            label: <FormattedMessage id="tableBlock.soldOut" defaultMessage="Sold out" />,
            defaultValue: false,
        },
    }),
    getCellStyle: ({ rowSettings }) => ({ opacity: rowSettings.soldOut ? 0.5 : undefined }),
});
```
