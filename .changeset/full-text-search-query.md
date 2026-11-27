---
"@dextinity/cms-api": minor
---

Add `fullTextSearch` query with type, highlighted snippet, title-first ranking and type filter

For each result, the query returns its type (the document type for page tree nodes, e.g. `Page` or `Link`), the title and the best matching paragraph with highlight ranges. Results whose name matches the search come first. The query also returns the number of results per type, and the `types` argument filters by type. See the [full-text search documentation](https://cms-docs.dextinity.com/docs/features-modules/full-text-search) for the arguments and fields.

`FullTextSearchQueryService` and `FullTextSnippetService` are exported, so a site search resolver can return the same results.

Both `fullTextSearch` and `myFullTextSearch` now check the content scopes of the user's permissions: a user who has the `pageTree` permission only for one domain no longer finds pages of other domains. Entities without a scope, such as products, are now found when searching in a scope.

`myFullTextSearch` is deprecated and will be removed in version 11. Use `fullTextSearch` instead. `myFullTextSearch` now returns its results in the same order as `fullTextSearch`.
