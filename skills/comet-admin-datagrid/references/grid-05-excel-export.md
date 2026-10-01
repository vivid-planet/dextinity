# Grid Feature: Excel Export

Adds a "Download as Excel" action to the grid toolbar using `useDataGridExcelExport` and `CrudMoreActionsMenu`.

## Toolbar with Export

The toolbar receives an `exportApi` prop and renders the export action inside a `CrudMoreActionsMenu`.

```tsx
import { CrudMoreActionsMenu, DataGridToolbar, ExportApi, FillSpace, GridFilterButton, messages } from "@comet/admin";
import { Excel as ExcelIcon } from "@comet/admin-icons";
import { CircularProgress } from "@mui/material";
import { GridToolbarProps, GridToolbarQuickFilter } from "@mui/x-data-grid-pro";
import { FormattedMessage } from "react-intl";

interface EntitiesGridToolbarProps extends GridToolbarProps {
    toolbarAction?: ReactNode;
    exportApi: ExportApi;
}

function EntitiesGridToolbar({ toolbarAction, exportApi }: EntitiesGridToolbarProps) {
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

## Grid Component with Export Hook

```tsx
const exportApi = useDataGridExcelExport<
    GQLEntitiesGridQuery["entities"]["nodes"][0],
    GQLEntitiesGridQuery,
    Omit<GQLEntitiesGridQueryVariables, "offset" | "limit">
>({
    columns,
    variables: {
        ...muiGridFilterToGql(columns, dataGridProps.filterModel),
        // include any extra required variables (e.g. parent ID for sub-entity grids)
    },
    query: entitiesQuery,
    resolveQueryNodes: (data) => data.entities.nodes,
    totalCount: data?.entities.totalCount ?? 0,
    exportOptions: {
        fileName: "Entities",
    },
});

return (
    <DataGridPro
        {...dataGridProps}
        rows={rows}
        rowCount={rowCount}
        columns={columns}
        loading={loading}
        slots={{
            toolbar: EntitiesGridToolbar as GridSlotsComponent["toolbar"],
        }}
        slotProps={{
            toolbar: { toolbarAction, exportApi } as EntitiesGridToolbarProps,
        }}
    />
);
```

## Rules

- Import `ExportApi`, `messages`, `useDataGridExcelExport`, `CrudMoreActionsMenu` from `@comet/admin`
- Import `Excel as ExcelIcon` from `@comet/admin-icons`
- The toolbar interface extends `GridToolbarProps` and adds `exportApi: ExportApi`
- Pass the toolbar props via `slotProps.toolbar` with a type assertion
- The `Omit<..., "offset" | "limit">` generic removes pagination vars from the export query
- For sub-entity grids, include the parent ID in the `variables` object
- Columns with `disableExport: true` are excluded from the export (e.g. actions column, overview columns)
- Use `messages.downloadAsExcel` from `@comet/admin` for the i18n label
- Show `CircularProgress` spinner while export is loading
