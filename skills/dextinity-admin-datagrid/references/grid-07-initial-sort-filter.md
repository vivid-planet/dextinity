# Grid Feature: Initial Sort & Filter

Set default sort order and/or pre-applied filters when the grid first loads via `useDataGridRemote` options.

## Initial Sort

```tsx
const dataGridProps = {
    ...useDataGridRemote({
        initialSort: [
            { field: "inStock", sort: "desc" },
            { field: "price", sort: "asc" },
        ],
        queryParamsPrefix: "products",
    }),
    ...usePersistentColumnState("ProductsGrid"),
};
```

## Initial Filter

```tsx
const dataGridProps = {
    ...useDataGridRemote({
        initialFilter: {
            items: [{ field: "type", operator: "is", value: "shirt" }],
        },
        queryParamsPrefix: "products",
    }),
    ...usePersistentColumnState("ProductsGrid"),
};
```

## Rules

- `initialSort` accepts an array of `{ field: string, sort: "asc" | "desc" }` — supports multi-column sort
- `initialFilter.items` follows the MUI GridFilterItem shape: `{ field, operator, value }`
- Both are optional and can be combined
- These only set the initial state — users can change sort/filter interactively
