---
"@dextinity/cms-admin": minor
---

Render `TableBlock` with the data grid configured in `DextinityConfig`

`TableBlock` no longer needs `@mui/x-data-grid-pro`.
With the free `DataGrid`, rows and columns can only be moved with the menu items, not by dragging.
`TableBlock` treats every configured grid other than MUI's `DataGrid` as a Pro or Premium grid, so configure `DataGrid` itself, not a wrapper around it.

**Action required for drag-and-drop**

To keep drag-and-drop, configure the Pro or Premium grid:

```tsx
<DextinityConfigProvider dataGrid={{ component: DataGridPro }}>
```
