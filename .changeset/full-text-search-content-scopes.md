---
"@dextinity/cms-api": major
---

Only find entities in `myFullTextSearch` the user has the required permission for in the given `scope`

Before, a user who had the `pageTree` permission only for one domain also found the pages of other domains when searching in them. This requires the complete scope, as the admin passes it. Entities without a scope, such as products, are now found in every scope.
