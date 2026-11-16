# Boolean Field

## Component

```tsx
<CheckboxField fieldLabel={<FormattedMessage id="<entityName>.inStock" defaultMessage="In Stock" />} name="inStock" fullWidth variant="horizontal" />
```

## Rules

- Import `CheckboxField` from `@dextinity/admin`
- Uses `fieldLabel` prop (not `label`) — this is different from other field components
- Initialize it with `false` in the create-mode `initialValues` (`inStock: false`), or `true` if that's the intended default
- For toggles that trigger an immediate visible response (e.g. showing/hiding a FieldSet, activating a feature), prefer `SwitchField` instead — see [form-field-12-switch.md](form-field-12-switch.md)
