---
"@dextinity/cms-api": minor
---

Add action logs module for entity change snapshots

Decorate an entity with `@ActionLogs()` to record a snapshot on every change, and register `ActionLogsModule.forRoot()` once. A single `actionLogs(entity: String!, scope: JSONObject!, ...)` query returns the entries for one entity type, and `allActionLogs(...)` returns the entries of all logged entities. Both include entries whose entity has been deleted.

Access is decided per entity: `actionLogs` resolves the `@RequiredPermission` of the requested entity and checks it against the user for the requested scope. `allActionLogs` requires the new `actionLog` permission and returns only the entries of entities whose permission the user holds in one of the entry's scopes. An entity decorated with `@ActionLogs()` but without `@RequiredPermission` fails at startup.
