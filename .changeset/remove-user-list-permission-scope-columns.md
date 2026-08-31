---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Remove the "Permissions" and "Scopes" columns from the user permissions users list

The users list now shows only the name and email. The `permissionsCount` and `contentScopesCount` fields of `UserPermissionsUser` are deprecated and now return `0`. They will be removed in the next major version.
