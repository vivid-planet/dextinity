---
"@dextinity/cms-api": minor
---

Export `CombinedPermission` and the `CrudSearchField` type

`CombinedPermission` is needed to register the permission enum when building the GraphQL schema of a library that adds permissions, which previously required a deep import.
