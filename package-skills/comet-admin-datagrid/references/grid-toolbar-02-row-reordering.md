# Toolbar: Row Reordering

Row reordering grids have no search or filter — only the add button.

## Template

```tsx
import { Button, DataGridToolbar, FillSpace, StackLink } from "@comet/admin";
import { FormattedMessage } from "react-intl";
import { Add as AddIcon } from "@comet/admin-icons";

function <EntityName>sGridToolbar() {
    return (
        <DataGridToolbar>
            <FillSpace />
            <Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                <FormattedMessage id="<entityName>.<entityName>sGrid.newEntry" defaultMessage="New <EntityName>" />
            </Button>
        </DataGridToolbar>
    );
}
```

## Rules

- No `<GridToolbarQuickFilter />` — search is disabled for row reordering grids
- No `<GridFilterButton />` — filtering is disabled for row reordering grids
- Only `<FillSpace />` and the add button
