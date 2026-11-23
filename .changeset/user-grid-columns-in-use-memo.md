---
"@comet/cms-admin": patch
---

Fix duplicate columns and missing permission counts in `UserPermissionsUserGrid`

The permission, scope and actions columns were added to the memoized column array during render. `useMemo` returns the same array on every render, so each re-render added another copy of these columns, and React reported duplicate keys.
The grid also kept the first column definitions, which were made before the available permissions and content scopes had loaded. So the permission and scope columns never showed "All permissions" or "All scopes", the counts had no total, and the permission filter had no options.
