# Toolbar: Select / Picker

Select grids have search and filter but no add button — the toolbar is for finding entities to select.

## Template

```tsx
import { DataGridToolbar, FillSpace, GridFilterButton } from "@comet/admin";
import { GridToolbarQuickFilter } from "@mui/x-data-grid-pro";

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
