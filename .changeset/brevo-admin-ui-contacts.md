---
"@dextinity/brevo-admin": major
---

Rebuild the contacts and test contacts pages with `@dextinity/ui`

Both pages share one list with a search and a side panel to add and edit a contact. The import from CSV is a dialog with a file upload and shows the result, including the rows that failed, as a CSV download.

Editing a contact no longer unblocks a blocked contact.

**Breaking changes**

- `additionalGridFields` of `createBrevoContactsPage` and `createBrevoTestContactsPage` takes columns of the `DataGrid` of `@dextinity/ui` (`DataGridColumn<BrevoContactRow<YourAttributes>>[]`) instead of MUI `GridColDef[]`.
- `additionalFormFields` must use the fields of `@dextinity/ui-react-final-form` instead of the fields of `@dextinity/admin`, e.g.:

```tsx
additionalFormFields: (
    <>
        <SelectField name="attributes.SALUTATION" label="Salutation" options={salutationOptions} />
        <InputField name="attributes.FIRSTNAME" label="First name" required />
    </>
),
```

- The pages no longer use a `Stack`; the open contact is kept in the URL as `?selected=<id>`.
