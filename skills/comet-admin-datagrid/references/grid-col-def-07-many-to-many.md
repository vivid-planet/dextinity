# Column: ManyToMany / Array of Relations

```tsx
{
    ...dataGridManyToManyColumn,
    field: "tags",
    headerName: intl.formatMessage({ id: "product.tags", defaultMessage: "Tags" }),
    sortable: false,
    renderCell: ({ row }) => <>{row.tags.map((tag) => tag.title).join(", ")}</>,
    flex: 1,
    disableExport: true,
    minWidth: 150,
}
```

## Rules

- Spread `dataGridManyToManyColumn` from `@comet/admin` as the base
- Include the label field (e.g. `title`) in the GQL fragment for the related entity
- Use `disableExport: true` for array columns
- Use `sortable: false` — many-to-many cannot be sorted server-side
