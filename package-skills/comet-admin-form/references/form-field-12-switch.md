# Switch Field

Alternative to `CheckboxField` for boolean values. Renders a toggle switch with customizable labels.

## Component

```tsx
import { SwitchField } from "@comet/admin";

<SwitchField name="isActive" fieldLabel={<FormattedMessage id="<entityName>.isActive" defaultMessage="Active" />} variant="horizontal" fullWidth />;
```

## Rules

- Import `SwitchField` from `@comet/admin`
- Uses `fieldLabel` prop (same as `CheckboxField`)
- Prefer `SwitchField` when toggling causes an immediate visible response (e.g. showing/hiding a FieldSet, activating a feature)
- Prefer `CheckboxField` for simple boolean values without immediate UI feedback (e.g. "Accept terms", "In Stock")
