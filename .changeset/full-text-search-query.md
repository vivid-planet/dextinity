---
"@dextinity/cms-api": major
---

Return the type of each result and the number of results per type in `myFullTextSearch`, with results whose name matches first

`myFullTextSearch` returns `FullTextSearchResults` instead of `PaginatedEntityInfo`, and its results are of type `FullTextSearchResult` instead of `EntityInfo`, so fragments on `EntityInfo` must be changed. `limit` is at most 50. See the [full-text search documentation](https://cms-docs.dextinity.com/docs/features-modules/full-text-search).
