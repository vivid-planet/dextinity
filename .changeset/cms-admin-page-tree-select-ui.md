---
"@dextinity/cms-admin": major
---

Build the page tree select with `@dextinity/ui`

`PageTreeSelect` is now a `Picker` field of the design system that shows the chosen page's name and path and opens the new `PageTreeSelectDialog`: the categories as a segmented control, a search, and the page tree as a `TreeView`, with the chosen page preselected and its ancestors expanded. `FinalFormPageTreeSelect`, used by `InternalLinkBlock`, renders it too.

- `PageTreeSelect` takes the props of `Picker` (e.g. `label`, `required`, `disabled`) next to `value` and `onChange`; its label defaults to "Page". MUI-specific props and theme overrides no longer apply.
- `PageTreeSelectDialog` no longer closes itself after a choice, and `defaultCategory` is optional.
- A page is chosen with "Select" or Enter instead of a click on the row.

**New**

- `PageTreeSelectField`: the field for forms built with `@dextinity/ui-react-final-form`

```tsx
<PageTreeSelectField name="targetPage" label={intl.formatMessage({ id: "link.targetPage", defaultMessage: "Target page" })} />
```
