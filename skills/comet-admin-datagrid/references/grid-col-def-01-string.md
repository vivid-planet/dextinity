# Column: String

## Primary label field

```tsx
{
    field: "title",
    headerName: intl.formatMessage({ id: "product.title", defaultMessage: "Title" }),
    flex: 1,
    minWidth: 200,
}
```

## Secondary field

```tsx
{
    field: "slug",
    headerName: intl.formatMessage({ id: "product.slug", defaultMessage: "Slug" }),
    width: 150,
}
```

## Rules

- Use `flex: 1` + `minWidth` for the primary label column so it fills available space
- Use fixed `width` for secondary string fields
