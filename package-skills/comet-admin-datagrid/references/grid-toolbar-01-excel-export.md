# Toolbar: With Excel Export

Extends the standard toolbar with an export action via `CrudMoreActionsMenu`. The toolbar receives an `exportApi` prop passed through `slotProps.toolbar`.

## Template

```tsx
import { CrudMoreActionsMenu, DataGridToolbar, ExportApi, FillSpace, GridFilterButton, messages } from "@comet/admin";
import { Excel as ExcelIcon } from "@comet/admin-icons";
import { CircularProgress } from "@mui/material";
import { GridToolbarProps, GridToolbarQuickFilter } from "@mui/x-data-grid-pro";
import { FormattedMessage } from "react-intl";
import { ReactNode } from "react";

interface <EntityName>sGridToolbarProps extends GridToolbarProps {
    toolbarAction?: ReactNode;
    exportApi: ExportApi;
}

function <EntityName>sGridToolbar({ toolbarAction, exportApi }: <EntityName>sGridToolbarProps) {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <GridFilterButton />
            <FillSpace />
            <CrudMoreActionsMenu
                slotProps={{
                    button: {
                        responsive: true,
                    },
                }}
                overallActions={[
                    {
                        label: <FormattedMessage {...messages.downloadAsExcel} />,
                        icon: exportApi.loading ? <CircularProgress size={20} /> : <ExcelIcon />,
                        onClick: () => exportApi.exportGrid(),
                        disabled: exportApi.loading,
                    },
                ]}
            />
            {toolbarAction}
        </DataGridToolbar>
    );
}
```

## Wiring in the Grid

```tsx
<DataGridPro
    {...dataGridProps}
    slots={{
        toolbar: <EntityName>sGridToolbar as GridSlotsComponent["toolbar"],
    }}
    slotProps={{
        toolbar: { toolbarAction, exportApi } as <EntityName>sGridToolbarProps,
    }}
/>
```

## Rules

- The toolbar interface extends `GridToolbarProps` and adds `exportApi: ExportApi`
- Pass toolbar props via `slotProps.toolbar` with a type assertion
- Use `messages.downloadAsExcel` from `@comet/admin` for the i18n label
- Show `CircularProgress` spinner while export is loading
- `toolbarAction` is optional — include only if the grid accepts a `toolbarAction` prop
- Can also include an add button after `{toolbarAction}` if the grid has a create page
