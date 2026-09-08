# Nested Scalar Object Fields

Group related fields together using dot notation.

## Component

```tsx
<NumberField required variant="horizontal" fullWidth name="dimensions.width" label={<FormattedMessage id="<entityName>.width" defaultMessage="Width" />} />
<NumberField required variant="horizontal" fullWidth name="dimensions.height" label={<FormattedMessage id="<entityName>.height" defaultMessage="Height" />} />
<NumberField required variant="horizontal" fullWidth name="dimensions.depth" label={<FormattedMessage id="<entityName>.depth" defaultMessage="Depth" />} />
```

## Rules

- Use dot notation for nested fields (e.g. `dimensions.width`)
- Each nested property gets its own field component — use the appropriate type (`NumberField`, `TextField`, etc.)
- GQL fragment entry: `dimensions { width height depth }`
