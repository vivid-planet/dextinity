---
"@dextinity/admin": major
---

Remove the deprecated `disableTypography` prop of `FormSection`

The title is always rendered with `SectionHeadline` now.
Use `slotProps.title` to customize it instead, for example to set a custom `variant` on the underlying `Typography` or to hide the divider:

```diff
- <FormSection title="General" disableTypography>
+ <FormSection title="General" slotProps={{ title: { divider: false, slotProps: { headline: { variant: "h5" } } } }}>
```
