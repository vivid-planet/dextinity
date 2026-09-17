# Grid Feature: External Filter Prop

Grids can accept an external `filter` prop to scope results by parent context (e.g. filter by category). The external filter is combined with the grid's own filter using `{ and: [...] }`.

## Template

```tsx
type EntitiesGridProps = {
    filter?: GQLEntityFilter;
    toolbarAction?: ReactNode;
    rowAction?: (params: GridRenderCellParams<GQLEntitiesGridFragment>) => ReactNode;
    actionsColumnWidth?: number;
    onRowClick?: DataGridProProps["onRowClick"];
};

export function EntitiesGrid({ filter, toolbarAction, rowAction, actionsColumnWidth = 52, onRowClick }: EntitiesGridProps) {
    // ... standard setup

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);
    const { data, loading, error } = useQuery(entitiesQuery, {
        variables: {
            // Combine external filter with grid filter
            filter: filter ? { and: [gqlFilter, filter] } : gqlFilter,
            search: gqlSearch,
            sort: muiGridSortToGql(dataGridProps.sortModel, columns) ?? [],
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
        },
    });

    // ... render with toolbarAction and rowAction
}
```

## Common Props

| Prop                 | Type                             | Purpose                                                                      |
| -------------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| `filter`             | `GQLEntityFilter`                | External GQL filter combined with grid filter via `{ and: [...] }`           |
| `toolbarAction`      | `ReactNode`                      | Extra element rendered in the toolbar (passed via `slotProps`)               |
| `rowAction`          | `(params) => ReactNode`          | Custom action rendered in the actions column alongside edit/delete           |
| `actionsColumnWidth` | `number`                         | Width of actions column (default 52 for single action, 84 for edit + delete) |
| `onRowClick`         | `DataGridProProps["onRowClick"]` | Override row click behavior (alternative to `useStackSwitchApi`)             |

## Rules

- Import the filter type from `@src/graphql.generated` (e.g. `GQLProductFilter`)
- When `filter` prop is provided, wrap with `{ and: [gqlFilter, filter] }`
- When `filter` prop is not provided, use `gqlFilter` directly
- `toolbarAction` is passed to toolbar via `slotProps.toolbar`
- `rowAction` is rendered inside the actions column `renderCell`
