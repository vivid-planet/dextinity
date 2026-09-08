# Toolbar: Standard

The default grid toolbar with quick search, column filtering, and an add button. Passed to the DataGrid via `slots.toolbar`.

## Template

```tsx
import { Button, DataGridToolbar, FillSpace, GridFilterButton, StackLink } from "@comet/admin";
import { GridToolbarQuickFilter } from "@mui/x-data-grid-pro";
import { FormattedMessage } from "react-intl";
import { Add as AddIcon } from "@comet/admin-icons";

export function <EntityName>sGridToolbar() {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <GridFilterButton />
            <FillSpace />
            <Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                <FormattedMessage id="<entityName>.<entityName>sGrid.newEntry" defaultMessage="New <EntityName>" />
            </Button>
        </DataGridToolbar>
    );
}
```

## Rules

- Always include `<GridToolbarQuickFilter />` — drives the `search` GQL variable via `muiGridFilterToGql`
- Always include `<GridFilterButton />` — opens the column filter panel
- Always include `<FillSpace />` between filter controls and action buttons
- Include the "New X" `<Button>` only if the entity has an add/create page (`pageName="add"`)
- Omit the add button if the entity is read-only or creation is handled elsewhere
- `FormattedMessage` id convention: `<entityName>.<entityName>sGrid.newEntry`
- Import `GridToolbarQuickFilter` from `@mui/x-data-grid-pro` (not from `@comet/admin`)
