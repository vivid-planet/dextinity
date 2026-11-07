---
"@dextinity/brevo-admin": major
---

Rebuild the target groups with `@dextinity/ui`

The list exports a target group's contacts as CSV and duplicates or deletes target groups from the row menu. A new target group is created in a dialog. The edit page holds the title and the filters, and shows the contacts added by hand and all assigned contacts in tabs: contacts are added in a dialog that keeps the selection across pages and searches, imported from CSV, and removed one by one or in bulk.

**Breaking changes**

- `additionalFormFields` of `createTargetGroupsPage` must use the fields of `@dextinity/ui-react-final-form`, e.g. `<SelectField name="filters.BRANCH" label="Branch" options={branchOptions} multiple />`.
- `exportTargetGroupOptions.exportFields` takes columns of the `DataGrid` of `@dextinity/ui` (`DataGridColumn<BrevoContactRow<YourAttributes>>[]`, exported as `ExportTargetGroupOptions`) instead of `{ renderValue, headerName }` objects. The value of a column comes from `exportValue`, `getValue` or the row's field of the column's `key`.
- The edit page of a target group is a route at `<list URL>/<id>/edit` instead of a `Stack` page.
- The `DataGrid` of `@dextinity/brevo-admin` that resolved the grid configured in `DextinityConfig` is removed, as no page uses it anymore.
