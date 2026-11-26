---
"@dextinity/cms-api": major
"@dextinity/cms-admin": major
---

Move the column size and the highlighting of the table block into default settings

Columns and rows no longer have the fields `size` and `highlighted`.
A table without `columnSettings` or `rowSettings` uses `defaultTableColumnSettings` (`size` and `highlighted`) and `defaultTableRowSettings` (`highlighted`) instead, so a project can leave them out or offer other sizes.

A migration moves the existing values into `settings` when the table is loaded, and `migrateBlocks` saves them.
Only the settings the table declares are moved.

The site must read the values from `settings`:

```diff
- const isHighlighted = row.highlighted || column.highlighted;
+ const isHighlighted = row.settings.highlighted || column.settings.highlighted;
```

The admin grid reads the width of a column from `settings.size`. Pass `getColumnWidth` to `createTableBlock` for other sizes.
The default `getCellStyle` is `getHighlightedTableCellStyle`, which gives the cells of a highlighted row or column a background.
A `select` or `multiSelect` setting takes an `icon` for its submenu in the admin.

**Example**

Extend the defaults with your own settings:

```ts
// API
const TableBlock = createTableBlock(
    {
        richText: RichTextBlock,
        rowSettings: createTableSettings({
            ...defaultTableRowSettings,
            soldOut: { type: "checkbox", defaultValue: false },
        }),
    },
    "Table",
);
```

```tsx
// Admin
const TableBlock = createTableBlock({
    name: "Table",
    richText: RichTextBlock,
    rowSettings: createTableSettings({
        ...defaultTableRowSettings,
        soldOut: {
            type: "checkbox",
            label: <FormattedMessage id="tableBlock.soldOut" defaultMessage="Sold out" />,
            defaultValue: false,
        },
    }),
    getCellStyle: (cell) => ({
        ...getHighlightedTableCellStyle(cell),
        opacity: cell.rowSettings.soldOut ? 0.5 : undefined,
    }),
});
```
