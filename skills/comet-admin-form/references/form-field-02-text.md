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

- Import `TextAreaField` from `@comet/admin`
- Use for longer text fields; use `TextField` for short single-line strings
