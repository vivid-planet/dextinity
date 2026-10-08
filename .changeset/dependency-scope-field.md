---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Support scopes in `DependentsList` and `DependenciesList`

Entities can be used across scopes, for instance a DAM that is shared between multiple sites. Until now, the links in both lists always pointed to the currently active scope, leading to a wrong or non-existent page. In addition, the lists didn't show which scope an entry belongs to.

The `Dependency` type now has a `scope` field, which is resolved from the entity's `scope` property or its `@ScopedEntity()` decorator. Both lists use it to link to the entry in its own scope and show a scope column when more than one scope exists.

**Example**

Request the new field in your dependents/dependencies queries:

```diff
    dependents(offset: $offset, limit: $limit, forceRefresh: $forceRefresh, filter: $filter, sort: $sort) {
        nodes {
            rootGraphqlObjectType
            rootId
            rootColumnName
            jsonPath
            name
            secondaryInformation
            visible
+           scope
        }
        totalCount
    }
```
