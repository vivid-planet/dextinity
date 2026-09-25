# Column: Nested Scalar Object

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

- Use `sortable: false` and `filterable: false` — nested objects cannot be sorted/filtered server-side
- Field name uses underscore notation: `parentField_nestedField`
- Use `valueGetter` with optional chaining to extract the nested value
- Formatting is case-by-case — ask the user how to display the nested fields
