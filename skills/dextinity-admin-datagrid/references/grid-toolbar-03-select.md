# Toolbar: Select / Picker

Select grids have search and filter but no add button — the toolbar is for finding entities to select.

## Template

```tsx
import { DataGridToolbar, FillSpace, GridFilterButton, GridToolbarQuickFilter } from "@dextinity/admin";

function Select<EntityName>sGridToolbar() {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <GridFilterButton />
            <FillSpace />
        </DataGridToolbar>
    );
}
```

## Rules

- No add button — selection grids are read-only pickers
- Keep `<GridToolbarQuickFilter />` and `<GridFilterButton />` for search/filter
- `<FillSpace />` at the end keeps layout consistent
