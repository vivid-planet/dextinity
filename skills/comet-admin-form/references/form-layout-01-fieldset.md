# FieldSet

`FieldSet` groups related form fields into collapsible sections directly inside the form component.

## Usage

```tsx
import { FieldSet } from "@comet/admin";

<FieldSet initiallyExpanded title={<FormattedMessage id="entity.fieldSet.general" defaultMessage="General" />}>
    <TextField required variant="horizontal" fullWidth name="name" label={...} />
    <TextField variant="horizontal" fullWidth name="description" label={...} />
</FieldSet>
<FieldSet initiallyExpanded title={<FormattedMessage id="entity.fieldSet.settings" defaultMessage="Settings" />}>
    <CheckboxField fullWidth variant="horizontal" name="isActive" fieldLabel={...} />
    <NumberField required variant="horizontal" fullWidth name="sortOrder" label={...} />
</FieldSet>
```

## Rules

- Always use `initiallyExpanded` so sections are open by default
- Import `FieldSet` from `@comet/admin`
- See the SKILL.md "Layout & Patterns" section for grouping guidelines
