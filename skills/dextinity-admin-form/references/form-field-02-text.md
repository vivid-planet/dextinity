# Text (Multiline) Field

For longer nullable string fields.

## Component

```tsx
<TextAreaField
    variant="horizontal"
    fullWidth
    name="description"
    label={<FormattedMessage id="<entityName>.description" defaultMessage="Description" />}
/>
```

## Rules

- Import `TextAreaField` from `@dextinity/admin`
- **Nullable fields**: a cleared `TextAreaField` holds `undefined`, so the field would be omitted from the update and the old value kept. Send it as `null` in `handleSubmit` (`description: formValues.description ?? null`)
- Use for longer text fields; use `TextField` for short single-line strings
