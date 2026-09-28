---
"@dextinity/cms-api": minor
---

Add action logs module for entity change snapshots

Decorate an entity with `@ActionLogs()` to record a snapshot on every change, and register `ActionLogsModule.forRoot()` once. A single `actionLogs(entity: String!, scope: JSONObject!, ...)` query returns the entries for one entity type, including those whose entity has been deleted.

Access is decided per entity: the query resolves the `@RequiredPermission` of the requested entity and checks it against the user for the requested scope. An entity decorated with `@ActionLogs()` but without `@RequiredPermission` fails at startup.
