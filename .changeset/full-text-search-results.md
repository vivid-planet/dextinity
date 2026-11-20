---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Add `fullTextSearch` query with type, highlighted snippet, title-first ranking and type filter

The admin search bar only showed the names of the results, in no particular order, so it was hard to tell why an item was found and to find the item you were looking for.

The new `fullTextSearch` query returns, for each result, its type (the document type for page tree nodes, e.g. `Page` or `Link`), the title and the best matching paragraph with the matching words highlighted. Results whose name matches the search come first. The query also returns the number of results per type, and the `types` argument filters the results by type.

**Example**

```graphql
query Search($search: String!, $types: [String!]) {
    fullTextSearch(search: $search, types: $types, limit: 10) {
        totalCount
        types {
            type
            count
        }
        nodes {
            id
            entityName
            type
            title {
                text
                highlights {
                    start
                    end
                }
            }
            snippet {
                text
                truncatedStart
                truncatedEnd
                highlights {
                    start
                    end
                }
            }
        }
    }
}
```

`SearchHeaderItem` uses the new query. It shows a chip per type to filter the results, and the type and a highlighted snippet for each result. The type labels come from the `displayName` in the `entityDependencyMap`.

`FullTextSearchQueryService` and `FullTextSnippetService` are exported, so a site search resolver can return the same results.

Both queries now check the content scopes of the user's permissions: a user who has the `pageTree` permission only for one domain no longer finds pages of other domains. Entities without a scope, such as products, are now found when searching in a scope.

`myFullTextSearch` is deprecated. Use `fullTextSearch` instead. `myFullTextSearch` now returns its results in the same order as `fullTextSearch`.
