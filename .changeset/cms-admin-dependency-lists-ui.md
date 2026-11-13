---
"@dextinity/cms-admin": major
---

Build `DependentsList` and `DependenciesList` with the `DataGrid` of `@dextinity/ui`

The props and the GraphQL contract of the queries (`offset`, `limit`, `forceRefresh`, `filter`, `sort`) stay the same. The lists search the name and the secondary information, filter by type and visibility, open an entry by clicking its row, and copy its link. When an entry is in a scope the user can't access, its disabled actions explain why on hover and focus; a link that can't be copied is reported in a toast.

- The MUI filter panel is replaced by the filter bar. Filters other than search, type and visibility aren't available anymore.
- The `dataGrid.component` of `DextinityConfigProvider` (e.g. the MUI X Pro `DataGrid`) no longer applies to these lists.
- The search, filters, sort and page are kept in the URL with the prefix `dependents_` or `dependencies_` instead of the parameters of `useDataGridRemote`, so old links open the lists unfiltered.
