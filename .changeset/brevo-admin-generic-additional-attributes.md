---
"@dextinity/brevo-admin": patch
---

Type `input2State` and `exportTargetGroupOptions.exportFields[].renderValue` with the project's additional attributes

`createBrevoContactsPage`, `createBrevoTestContactsPage` and `createTargetGroupsPage` are now generic over the data queried with `additionalAttributesFragment` and `nodeFragment`.
The type is inferred from the callbacks, so a callback can declare its concrete fragment type without failing under `strictFunctionTypes`:

```ts
createTargetGroupsPage({
    exportTargetGroupOptions: {
        additionalAttributesFragment,
        exportFields: [{ renderValue: (row: GQLBrevoContactAttributesFragment) => row.attributes.FIRSTNAME, headerName: "First name" }],
    },
    nodeFragment,
    input2State: (values?: GQLTargetGroupFiltersFragment & { title: string }) => ({ title: values?.title ?? "", filters: values?.filters }),
});
```
