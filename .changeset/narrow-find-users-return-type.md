---
"@dextinity/cms-api": minor
---

Narrow the `findUsers` result to a minimal `UserListItem` type

`UserPermissionsUserServiceInterface.findUsers` (and `UserPermissionsService.findUsers`) now return `Pick<User, "id" | "name" | "email">` items instead of the full `User` type. The paginated user list only ever needs these three fields, so this avoids forcing consumers to expose project-specific `User` fields (added via declaration merging) just to satisfy the list contract.

`UserResolver`'s permission-filter checks (`permissionAndFiltersApplies` / `permissionOrFiltersApplies`) now re-fetch the full `User` via `findUserOrThrow` before evaluating permissions, since `hasPermission` still requires the complete `User`.
