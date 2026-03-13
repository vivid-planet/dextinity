# Column: ID

```tsx
{
    ...dataGridIdColumn,
    field: "id",
    headerName: intl.formatMessage({ id: "entity.id", defaultMessage: "ID" }),
    flex: 1,
    minWidth: 150,
}
```

## Rules

- Spread `dataGridIdColumn` from `@comet/admin` as the base
- Only include if the user explicitly wants to show the ID column (not common)
