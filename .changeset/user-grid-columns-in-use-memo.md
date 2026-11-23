---
"@comet/cms-admin": patch
---

Show the total counts, "All permissions" and "All scopes" in `UserPermissionsUserGrid` when the grid first loads

The grid kept the column definitions from before the available permissions and content scopes had loaded, until a change such as a filter made it read the columns again.
Until then, the permission and scope columns showed, for instance, "2 of permissions" instead of "2 of 4 permissions", and never "All permissions" or "All scopes".
