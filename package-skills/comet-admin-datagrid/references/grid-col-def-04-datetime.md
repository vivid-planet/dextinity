# Column: DateTime / LocalDate

## DateTime

```tsx
{
    ...dataGridDateTimeColumn,
    field: "createdAt",
    headerName: intl.formatMessage({ id: "product.createdAt", defaultMessage: "Created At" }),
    width: 170,
    visible: false, // audit timestamps are hidden by default
}
```

## LocalDate

```tsx
{
    ...dataGridDateColumn,
    field: "availableSince",
    headerName: intl.formatMessage({ id: "product.availableSince", defaultMessage: "Available Since" }),
    width: 140,
}
```

## Rules

- Spread `dataGridDateTimeColumn` or `dataGridDateColumn` from `@comet/admin` as the base
- Audit timestamps (`createdAt`, `updatedAt`) should use `visible: false` by default
