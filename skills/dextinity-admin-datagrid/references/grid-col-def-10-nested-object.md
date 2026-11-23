# Column: Nested Scalar Object

Whether a nested field can be filtered and sorted depends on how the API stores the object. Look up the underscore field name (e.g. `address_street`) in `<EntityName>Filter` and `<EntityName>SortField`:

- **Embedded object** (MikroORM `@Embedded`, e.g. `addressAsEmbeddable`): the API exposes `addressAsEmbeddable_street` etc. in both, so omit `filterable` and `sortable`
- **JSON object** (e.g. `address`): not in the schema's filter/sort types, so set `filterable: false` and `sortable: false`

```tsx
{
    field: "addressAsEmbeddable_street",
    headerName: intl.formatMessage({ id: "manufacturer.addressAsEmbeddable.street", defaultMessage: "Address As Embeddable Street" }),
    valueGetter: (_value, row) => row.addressAsEmbeddable?.street,
    flex: 1,
    minWidth: 150,
}
```

```tsx
{
    field: "address_street",
    headerName: intl.formatMessage({ id: "manufacturer.address.street", defaultMessage: "Address Street" }),
    filterable: false,
    sortable: false,
    valueGetter: (_value, row) => row.address?.street,
    flex: 1,
    minWidth: 150,
}
```

## Deeply Nested

Use underscore-separated field names for deeply nested objects:

```tsx
{
    field: "address_alternativeAddress_street",
    headerName: intl.formatMessage({ id: "manufacturer.address.alternativeAddress.street", defaultMessage: "Alt-Address Street" }),
    filterable: false,
    sortable: false,
    valueGetter: (_value, row) => row.address?.alternativeAddress?.street,
    flex: 1,
    minWidth: 150,
}
```

## Rules

- Set `filterable: false` / `sortable: false` only when the underscore field name is missing from `<EntityName>Filter` / `<EntityName>SortField`
- Field name uses underscore notation: `parentField_nestedField` — it must match the filter/sort field name so `muiGridFilterToGql` and `muiGridSortToGql` send it to the API
- Use `valueGetter` with optional chaining to extract the nested value
- Formatting is case-by-case — ask the user how to display the nested fields
