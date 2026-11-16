# Column: OneToMany

```tsx
{
    ...dataGridOneToManyColumn,
    field: "variants",
    headerName: intl.formatMessage({ id: "product.variants", defaultMessage: "Variants" }),
    sortable: false,
    renderCell: ({ row }) => <>{row.variants.map((variant) => variant.name).join(", ")}</>,
    flex: 1,
    disableExport: true,
    minWidth: 150,
}
```

## Rules

- Spread `dataGridOneToManyColumn` from `@dextinity/admin` as the base
- Include the label field (e.g. `name`) in the GQL fragment for the related entity
- Use `disableExport: true` for array columns
- Use `sortable: false` — one-to-many fields are not in `<EntityName>SortField`. They usually are in `<EntityName>Filter` (`OneToManyFilter`), so keep the column filterable; check the schema
