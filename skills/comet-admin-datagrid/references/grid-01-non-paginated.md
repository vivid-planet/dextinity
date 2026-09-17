# Grid Variant: Non-Paginated

Used when the GraphQL query returns a flat list (`[Entity!]!`) instead of a paginated wrapper (`{ nodes, totalCount }`). Common for simple lookup entities or fixed-size lists.

## Template

```tsx
import { useDataGridUrlState } from "@comet/admin";

export function EntitiesGrid() {
    const client = useApolloClient();
    const intl = useIntl();
    // useDataGridUrlState instead of useDataGridRemote
    const dataGridProps = { ...useDataGridUrlState(), ...usePersistentColumnState("EntitiesGrid") };

    const columns: GridColDef<GQLEntitiesGridItemFragment>[] = useMemo(
        () => [
            // columns as normal
        ],
        [intl, client],
    );

    const { data, loading, error } = useQuery<GQLEntitiesGridQuery, GQLEntitiesGridQueryVariables>(entitiesQuery, {
        variables: {},
    });
    if (error) throw error;
    // Direct array, no .nodes or .totalCount
    const rows = data?.entities ?? [];

    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            columns={columns}
            loading={loading}
            slots={{ toolbar: EntitiesGridToolbar as GridSlotsComponent["toolbar"] }}
            onRowClick={handleRowClick}
        />
    );
}
```

## GQL

```graphql
query EntitiesGrid {
    entities {
        ...EntitiesGridItem
    }
}
```

## Rules

- Use `useDataGridUrlState` instead of `useDataGridRemote`
- No `offset`, `limit`, `sort`, `search`, `filter` variables in the query
- No `rowCount`, no `useBufferedRowCount`
- No `muiGridFilterToGql` or `muiGridSortToGql`
- Rows come directly from `data?.entities ?? []` (no `.nodes`)
