# Column: Array of Scalars

```tsx
{
    field: "articleNumbers",
    headerName: intl.formatMessage({ id: "product.articleNumbers", defaultMessage: "Article Numbers" }),
    width: 200,
    sortable: false,
    valueGetter: (value: string[]) => value?.join(", "),
}
```

## Rules

- Use `sortable: false` — arrays cannot be sorted server-side
- Use `valueGetter` to join array values into a comma-separated string
