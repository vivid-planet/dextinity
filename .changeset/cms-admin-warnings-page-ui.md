---
"@dextinity/cms-admin": major
---

Build `WarningsPage` with the `ListLayout` and `DataGrid` of `@dextinity/ui`

The props stay the same. The page filters the warnings by severity (with counts), status (open, resolved, ignored), type, scope (with `showAllScopes`) and the visibility of their content. A click on a warning opens its source.

- The MUI filter panel is replaced by the filter bar. Filters by message, date or name aren't available anymore; the search still covers the name and the secondary information.
- The `dataGrid.component` of `DextinityConfigProvider` (e.g. the MUI X Pro `DataGrid`) no longer applies to the warnings.
- The search, filters, sort and page are kept in the URL (`q`, `filter_severity`, `filter_status`, `filter_type`, `filter_scope`, `filter_visibleOnly`, `sort`, `page`) instead of the parameters of `useDataGridRemote`, so old links open the list unfiltered.
