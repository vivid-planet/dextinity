---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Allow several block types per table cell

Pass `cellBlocks` to `createTableBlock` instead of `richText` to offer more than rich text in a cell.
The first block is the default for new cells.
The cell editor then shows a select to change a cell's type, and switching back to a type restores the content the cell had in it.

**Example**

```ts
// API
const TableBlock = createTableBlock({ cellBlocks: { richText: TableCellRichTextBlock, price: PriceCellBlock } }, "Table");
```

```tsx
// Admin
const TableBlock = createTableBlock({ name: "Table", cellBlocks: { richText: TableCellRichTextBlock, price: PriceCellBlock } });
```

In the admin, every cell block needs a `ReadOnlyComponent`, which renders the cell in the table grid.

A cell with `cellBlocks` stores a one-of block named after the table (e.g., `TableCell`), so the site renders the active block from `block.type` and `block.props`.
Switching an existing table from `richText` to `cellBlocks` changes the shape of its cells, so its stored content needs a block migration.
