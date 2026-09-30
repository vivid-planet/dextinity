---
"@dextinity/cms-admin": minor
---

Open the version history of an entity from `GlobalActionLogPage`

A row action on the global Action Log opens `ActionLogDialog` for the entity of the row, including a deleted one.

`ActionLogDialog` accepts `acrossScopes` to read the versions of the entity in every scope the user may read, through `allActionLogs`, instead of the current content scope.
