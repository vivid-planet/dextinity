# Grid Variant: Select / Checkbox

Used for picker dialogs where users select one or multiple entities.

## Multi-Select Template

```tsx
type SelectEntitiesGridProps = {
    rowSelectionModel?: DataGridProProps["rowSelectionModel"];
    onRowSelectionModelChange?: DataGridProProps["onRowSelectionModelChange"];
};

export function SelectEntitiesGrid({ rowSelectionModel, onRowSelectionModelChange }: SelectEntitiesGridProps) {
    const intl = useIntl();
    const dataGridProps = {
        ...useDataGridRemote(),
        ...usePersistentColumnState("SelectEntitiesGrid"),
        rowSelectionModel,
        onRowSelectionModelChange,
        checkboxSelection: true,
        keepNonExistentRowsSelected: true,
    };

    const columns: GridColDef<GQLSelectEntitiesGridFragment>[] = useMemo(
        () => [
            // data columns only, no actions column
        ],
        [intl],
    );

    // ... standard query wiring

    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            rowCount={rowCount}
            columns={columns}
            loading={loading}
            slots={{ toolbar: SelectEntitiesGridToolbar as GridSlotsComponent["toolbar"] }}
        />
    );
}
```

## Toolbar

Toolbar has only search and filter — no add button:

```tsx
function SelectEntitiesGridToolbar() {
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

- No actions column, no delete mutation, no edit icon button
- No `onRowClick` — selection is via checkboxes
- `keepNonExistentRowsSelected: true` retains selections across pages
- No `useStackSwitchApi` or `useApolloClient` needed
- Toolbar has only search/filter, no add button
