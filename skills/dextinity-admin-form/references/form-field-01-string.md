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
- Import `TextField` from `@dextinity/admin`
- **Nullable fields**: a cleared `TextField` holds `undefined`, so the field would be omitted from the update and the old value kept. Send it as `null` in `handleSubmit` (`title: formValues.title ?? null`)
