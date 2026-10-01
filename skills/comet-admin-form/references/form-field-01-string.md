# String Field

## Component

```tsx
<TextField
    required // if non-nullable in schema
    variant="horizontal"
    fullWidth
    name="title"
    label={<FormattedMessage id="<entityName>.title" defaultMessage="Title" />}
/>
```

## Rules

- Use `required` when the field is non-nullable in the GraphQL schema
- Import `TextField` from `@comet/admin`
