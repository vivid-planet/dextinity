---
"@dextinity/cms-admin": major
---

Build the user permissions with `@dextinity/ui`

`UserPermissionsPage` shows the users in a `ListLayout` with a search, a filter by permission and sorting, and each user on an `EditLayout` page with the tabs Permissions and Basic data. The URLs of the users stay the same (`<list>/<id>/edit` and `<list>/<id>/edit/basic-data`). Scopes are added as a searchable tree of the available scopes, several at once; a custom scope (e.g. with `*` for all values of a dimension) can still be built dimension by dimension.

- `UserPermissionsUserGrid` renders the whole list page including its `PageHeader`; `toolbarAction` goes into the header's actions. `rowAction` receives the user instead of the MUI `GridRenderCellParams` and replaces the default row menu (edit, impersonate). `actionsColumnWidth` is removed; `onRowClick` is new. The search, filter, sort and page are kept in the URL (`q`, `filter_permission`, `sort`, `page`), and the `dataGrid.component` of `DextinityConfigProvider` no longer applies.
- `UserPermissionsUserPageToolbar` renders a `PageHeader` of `@dextinity/ui` instead of a `StackToolbar`; pass the link to the list as `back`.
- `UserPermissionsUserPageBasicDataPanel` and `UserPermissionsUserPagePermissionsPanel` render `Panel`s of `@dextinity/ui`.
- `StartImpersonationButton` and `StopImpersonationButton` are `Button`s of `@dextinity/ui`: `StopImpersonationButton` takes their props (`StopImpersonationButtonProps`) instead of MUI's `ButtonProps`, and `StartImpersonationButton` has a new `impersonationAllowed` prop that disables it with the reason.
