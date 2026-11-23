# Grid Variant: Row Reordering

Used when entities have a `position` field and need drag-and-drop reordering. The grid is sorted by position, pagination is hidden, and filtering/sorting/search are disabled.

## Template

```tsx
import { GridRowOrderChangeParams } from "@mui/x-data-grid-pro";

// Additional mutation for position updates
const updateEntityPositionMutation = gql`
    mutation UpdateEntityPosition($id: ID!, $input: EntityUpdateInput!) {
        updateEntity(id: $id, input: $input) {
            id
            position
            updatedAt
        }
    }
`;

export function EntitiesGrid() {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = {
        ...useDataGridRemote({
            queryParamsPrefix: "entities",
        }),
        ...usePersistentColumnState("EntitiesGrid"),
    };

    const handleRowOrderChange = async ({ row: { id }, targetIndex }: GridRowOrderChangeParams) => {
        await client.mutate<GQLUpdateEntityPositionMutation, GQLUpdateEntityPositionMutationVariables>({
            mutation: updateEntityPositionMutation,
            variables: { id, input: { position: targetIndex + 1 } },
            awaitRefetchQueries: true,
            refetchQueries: [entitiesQuery],
        });
    };

    const columns: GridColDef<GQLEntitiesGridFragment>[] = useMemo(
        () => [
            {
                field: "title",
                headerName: intl.formatMessage({ id: "entity.title", defaultMessage: "Title" }),
                filterable: false,
                sortable: false,
                flex: 1,
                minWidth: 150,
            },
            // ... all columns must have filterable: false and sortable: false
        ],
        [intl, client],
    );

    // Query uses fixed sort by position, no filter/search, loads up to 100 rows (the maximum `limit` of OffsetBasedPaginationArgs)
    const { data, loading, error } = useQuery<GQLEntitiesGridQuery, GQLEntitiesGridQueryVariables>(entitiesQuery, {
        variables: {
            sort: [{ field: "position", direction: "ASC" }],
            offset: 0,
            limit: 100,
        },
    });

    const rowCount = useBufferedRowCount(data?.entities.totalCount);
    if (error) throw error;

    // Map rows to include __reorder__ field for drag preview
    const rows =
        data?.entities.nodes.map((node) => ({
            ...node,
            __reorder__: node.title,
        })) ?? [];

    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            rowCount={rowCount}
            columns={columns}
            loading={loading}
            showToolbar
            slots={{ toolbar: EntitiesGridToolbar as GridSlotsComponent["toolbar"] }}
            rowReordering
            onRowOrderChange={handleRowOrderChange}
            hideFooterPagination
            onRowClick={handleRowClick}
        />
    );
}
```

## Toolbar

Row reordering grids have no search or filter — only the add button:

```tsx
function EntitiesGridToolbar() {
    return (
        <DataGridToolbar>
            <FillSpace />
            <Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
                <FormattedMessage id="entity.entitiesGrid.newEntry" defaultMessage="New Entity" />
            </Button>
        </DataGridToolbar>
    );
}
```

## Rules

- All columns must have `filterable: false` and `sortable: false`
- Query uses fixed `sort: [{ field: "position", direction: "ASC" }]`, `offset: 0`, `limit: 100`
- **Size limit**: with a paginated query, the grid can only show and reorder the first 100 entries — `OffsetBasedPaginationArgs` rejects a higher `limit`, and pagination is hidden. Use this pattern only for lists that stay below 100 entries (e.g. categories, tags). If the list can grow beyond that, ask the user and make the list query non-paginated in the API (`paging: false`, see the API skill), then base the grid on [grid-01-non-paginated.md](grid-01-non-paginated.md) with the fixed position sort and the reordering props from this file
- Map rows to include `__reorder__` field (display text during drag, typically `title` or `name`)
- Add `rowReordering` and `hideFooterPagination` props to DataGridPro
- Toolbar omits `<GridToolbarQuickFilter />` and `<GridFilterButton />`
- The position mutation uses the entity's update mutation with `{ position: targetIndex + 1 }`
