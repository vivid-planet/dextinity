# Column: Array of Scalars

```tsx
{
    field: "articleNumbers",
    headerName: intl.formatMessage({ id: "product.articleNumbers", defaultMessage: "Article Numbers" }),
    width: 200,
    filterable: false,
    sortable: false,
    valueGetter: (value: string[]) => value?.join(", "),
}
```

## Rules

- Use `filterable: false` and `sortable: false` — scalar arrays are not in `<EntityName>Filter` / `<EntityName>SortField`
- Use `valueGetter` to join array values into a comma-separated string
