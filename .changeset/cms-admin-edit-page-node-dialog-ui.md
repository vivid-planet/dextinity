---
"@dextinity/cms-admin": major
---

Rebuild the dialog of `createEditPageNode` ("New page" / "Page properties") with `@dextinity/ui`

The component returned by `createEditPageNode` now renders its own `Dialog` with Cancel and Create/Save, and the fields are the `@dextinity/ui-react-final-form` adapters. The redirect explanation is shown as the description of the redirect switch, changing the document type of an existing page shows a warning, and a failed save is shown in the dialog.

**Breaking changes**

- `EditPageNodeProps` gets `open` and `onOpenChange`; render the component directly instead of inside `useEditDialog`'s `EditDialog`. `onSaved` is called with the id of the created or saved page.
- In `add` mode, `id` no longer carries serialized initial values. Pass the position as `initialValues={{ parent, pos }}` instead. `PageTreeDetailPage` and `PagesPage` already do this.
- `additionalFormFields` still render inside the React Final Form form, so `@dextinity/admin` fields keep working, but they look out of place. Use the adapters of `@dextinity/ui-react-final-form`:

```tsx
export const EditPageNode = createEditPageNode({
    nodeFragment: additionalPageTreeNodeFieldsFragment,
    valuesToInput: ({ values }) => ({ userGroup: values.userGroup }),
    additionalFormFields: <SelectField name="userGroup" label="User group" options={userGroupOptions} />,
});
```
