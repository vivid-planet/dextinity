# Column: ManyToOne Relation

```tsx
{
    field: "category",
    headerName: intl.formatMessage({ id: "product.category", defaultMessage: "Category" }),
    flex: 1,
    minWidth: 100,
    valueGetter: (_value, row) => row.category?.title,
    filterOperators: ProductCategoryFilterOperators,
}
```

## Rules

- Use `valueGetter` to extract the label field from the nested relation object
- Requires a custom filter component — see [grid-col-def-13-relation-filter.md](grid-col-def-13-relation-filter.md) for the `FilterOperators` pattern
- GQL fragment must include the nested selection: `category { id title }`
