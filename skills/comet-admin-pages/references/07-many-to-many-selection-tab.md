# ManyToMany Selection Tab

Used when an entity has a ManyToMany relation managed via a dedicated tab (e.g., "Products" tab on a Collection). The tab shows a read-only grid of currently associated items with a toolbar button to open a selection dialog.

## Structure

The pattern has two parts:

1. **Selected Items Grid** — non-paginated DataGrid showing currently associated items. Toolbar has search + a "Select" button that opens the dialog.
2. **Selection Dialog** — modal with a paginated, searchable checkbox DataGrid of all available items. Pre-selected items are checked. Confirming persists the selection.

## Template

```tsx
import { useApolloClient, useQuery } from "@apollo/client";
import {
    Button,
    DataGridToolbar,
    Dialog,
    FillSpace,
    type GridColDef,
    muiGridFilterToGql,
    muiGridSortToGql,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Edit as EditIcon, Remove as RemoveIcon, Select as SelectIcon } from "@comet/admin-icons";
import { useContentScope } from "@comet/cms-admin";
import { DialogActions, IconButton } from "@mui/material";
import { DataGridPro, type GridRowSelectionModel, type GridSlotsComponent, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid-pro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

// --- Selected Items Toolbar ---

function SelectedItemsToolbar({ onSelectItems }: { onSelectItems: () => void }) {
    return (
        <DataGridToolbar>
            <GridToolbarQuickFilter />
            <FillSpace />
            <Button responsive startIcon={<SelectIcon />} onClick={onSelectItems}>
                <FormattedMessage id="myEntity.items.selectItems" defaultMessage="Select Items" />
            </Button>
        </DataGridToolbar>
    );
}

// --- Selection Dialog Toolbar ---

function SelectItemsDialogToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
}

// --- Selection Dialog ---

function SelectItemsDialog({
    open,
    onClose,
    onSave,
    initialSelection,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (selectedIds: string[]) => void;
    initialSelection: string[];
}) {
    const intl = useIntl();
    const { scope } = useContentScope();
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(initialSelection);

    useEffect(() => {
        if (open) {
            setSelectionModel(initialSelection);
        }
    }, [open, initialSelection]);

    const dataGridProps = {
        ...useDataGridRemote({ queryParamsPrefix: "selectItems" }),
        ...usePersistentColumnState("SelectItemsDialog"),
    };

    const columns: GridColDef[] = useMemo(
        () => [
            // data columns only — no actions column
        ],
        [intl],
    );

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);
    const { data, loading, error } = useQuery(availableItemsQuery, {
        skip: !open,
        variables: {
            scope,
            filter: gqlFilter,
            search: gqlSearch,
            sort: muiGridSortToGql(dataGridProps.sortModel, columns) ?? [],
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
        },
    });

    const rowCount = useBufferedRowCount(data?.items.totalCount);
    if (error) throw error;
    const rows = data?.items.nodes ?? [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            title={<FormattedMessage id="myEntity.selectDialog.title" defaultMessage="Select Items" />}
        >
            <DataGridPro
                sx={{ height: "70vh" }}
                {...dataGridProps}
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                checkboxSelection
                rowSelectionModel={selectionModel}
                onRowSelectionModelChange={setSelectionModel}
                keepNonExistentRowsSelected
                slots={{
                    toolbar: SelectItemsDialogToolbar as GridSlotsComponent["toolbar"],
                }}
            />
            <DialogActions>
                <Button variant="textDark" onClick={onClose}>
                    <FormattedMessage id="myEntity.selectDialog.cancel" defaultMessage="Cancel" />
                </Button>
                <Button onClick={() => onSave(selectionModel.map(String))}>
                    <FormattedMessage id="myEntity.selectDialog.save" defaultMessage="Save Selection" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// --- Main Component ---

export function MyEntityItemsGrid({ entityId }: { entityId: string }) {
    const client = useApolloClient();
    const intl = useIntl();
    const { match: contentScopeMatch } = useContentScope();
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data, loading, error } = useQuery(entityItemsQuery, {
        variables: { id: entityId },
    });

    const selectedItems = useMemo(() => data?.myEntity.items ?? [], [data]);
    const selectedItemIds = useMemo(() => selectedItems.map((item) => item.id), [selectedItems]);

    const columns: GridColDef[] = useMemo(
        () => [
            // data columns ...
            {
                field: "actions",
                headerName: "",
                sortable: false,
                filterable: false,
                type: "actions",
                align: "right",
                pinned: "right",
                width: 84,
                renderCell: (params) => (
                    <>
                        {/* Cross-entity edit link — uses RouterLink, NOT StackLink */}
                        <IconButton color="primary" component={RouterLink} to={`${contentScopeMatch.url}/items/edit/${params.row.id}`}>
                            <EditIcon />
                        </IconButton>
                        {/* Remove (unlink) — NOT delete */}
                        <IconButton
                            onClick={async () => {
                                const remainingIds = selectedItemIds.filter((id) => id !== params.row.id);
                                await client.mutate({
                                    mutation: updateEntityItemsMutation,
                                    variables: { id: entityId, input: { items: remainingIds } },
                                    refetchQueries: [entityItemsQuery],
                                });
                            }}
                        >
                            <RemoveIcon />
                        </IconButton>
                    </>
                ),
            },
        ],
        [intl, client, entityId, selectedItemIds, contentScopeMatch.url],
    );

    if (error) throw error;

    const handleSave = useCallback(
        async (newSelectedIds: string[]) => {
            await client.mutate({
                mutation: updateEntityItemsMutation,
                variables: { id: entityId, input: { items: newSelectedIds } },
            });
            setDialogOpen(false);
        },
        [client, entityId],
    );

    return (
        <>
            <DataGridPro
                rows={selectedItems}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                slots={{
                    toolbar: (() => <SelectedItemsToolbar onSelectItems={() => setDialogOpen(true)} />) as GridSlotsComponent["toolbar"],
                }}
            />
            <SelectItemsDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} initialSelection={selectedItemIds} />
        </>
    );
}
```

## Rules

- **Use Comet `Dialog`** (from `@comet/admin`) with the `title` prop — never use MUI `DialogTitle` as a child.
- **Never two primary buttons** in a dialog. Cancel and Save should both use the default Button variant. The page-level save is the primary action.
- **No `DialogContent` wrapper** when the dialog contains a DataGrid — place the `DataGridPro` directly inside the `Dialog` to avoid unwanted padding/margin. Set `sx={{ height: "70vh" }}` on the DataGrid itself.
- **`keepNonExistentRowsSelected: true`** — preserves checkbox selections across pages.
- **`skip: !open`** on the dialog query — don't fetch until the dialog opens.
- **Reset selection on open** — `useEffect` resets `selectionModel` to `initialSelection` when `open` changes.
- **Cross-entity navigation** — use `RouterLink` from `react-router-dom` with `contentScopeMatch.url` prefix, NOT `StackLink` (which only works within the same stack).
- **Remove, not delete** — unlinking an item from a ManyToMany relation uses `RemoveIcon` and filters the ID out of the array. The item itself is not deleted.
- **Select icon** — the toolbar button uses `SelectIcon` from `@comet/admin-icons`.
- **Separate GQL file** — put the queries/mutations in a co-located `.gql.ts` file (e.g., `MyEntityItemsGrid.gql.ts`).
