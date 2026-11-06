---
"@dextinity/cms-admin": minor
---

Add `useRemoteListState` and helpers for lists built with the `DataGrid` of `@dextinity/ui` that load their rows page by page

`useRemoteListState` keeps the search, the filters, the sort and the page of a list in the URL and debounces the search. Map it to the variables of the list query with `toGqlSort`, and pass it to `FilterBar` and `DataGrid`. `useRemoteListPagination` returns the `pagination` of the `DataGrid` with translated labels.

```tsx
const filters = { status: remoteListFilterParam.oneOf(["active", "deleted"]) };

const listState = useRemoteListState({ filters, sortableColumns: ["title", "date"], defaultSort: { key: "date", direction: "desc" } });
const { data } = useQuery(newsQuery, {
    variables: {
        offset: listState.offset,
        limit: listState.limit,
        search: listState.search,
        filter: listState.filters.status ? { status: { equal: listState.filters.status } } : undefined,
        sort: toGqlSort(listState.sort),
    },
});
const pagination = useRemoteListPagination(listState, data?.news.totalCount);
```

Also add `useRemoteListCsvExport`, which loads all pages of a list to export them as CSV, `usePersistentColumnVisibility`, `useDataGridLabels` and `usePaginationLabels`.
