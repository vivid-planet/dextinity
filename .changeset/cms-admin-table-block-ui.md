---
"@dextinity/cms-admin": minor
---

Edit the table block on the `DataGrid` of `@dextinity/ui`

The block keeps its state, input and output, and the editor no longer needs MUI X: the dialog, the grid, the row and column menus and the messages are built with `@dextinity/ui`.

- A cell opens its rich text editor in a panel at the cell with a double click, Enter or F2. Enter adds a paragraph; Escape, "Done", a click outside or Ctrl/Cmd+Enter keep the changes.
- Rows can be dragged by their grip, or moved with the arrow keys on it, with every data grid. Columns move with "Move left" and "Move right" in their menu; dragging column headers isn't supported anymore.
- All rows are shown on one page, also without MUI X Pro.

The `dataGrid` option of `DextinityConfigProvider` is deprecated, since only the table block used it. Remove it:

```diff
 <DextinityConfigProvider
-    dataGrid={{ component: DataGridPro }}
 >
```
