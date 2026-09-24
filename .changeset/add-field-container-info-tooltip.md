---
"@dextinity/admin": minor
---

Add `infoTooltip` prop to `FieldContainer` and `Field`

Form fields sometimes need additional explanation beyond the label. `FieldContainer` (and therefore every `Field`-based component like `TextField`) now accepts an `infoTooltip` prop that renders an info icon with a tooltip next to the label, mirroring the existing `infoTooltip` prop on `FormSection`.

**Example**

```tsx
<TextField name="slug" label="Slug" infoTooltip="Used to generate the page URL" />
```
