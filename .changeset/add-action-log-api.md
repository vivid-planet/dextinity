---
"@dextinity/cms-api": minor
---

Add an action log that records a snapshot of an entity on every change

Decorate an entity with `@ActionLogs()` and register `ActionLogsModule.forRoot()` once. Every create, update and delete then stores a snapshot of the entity together with the user who made the change.

```ts
@Entity()
@ObjectType()
@RequiredPermission("products", { skipScopeCheck: true })
@ActionLogs()
export class Product extends BaseEntity {
    // ...
}
```

The `actionLogs(entity, scope)` query returns the entries of one entity type, and `myActionLogs` returns the entries of all logged entities. Both include the entries of deleted entities.

`actionLogs` checks the `@RequiredPermission` of the entity against the user in the requested scope. `myActionLogs` requires the new `actionLog` permission and returns only the entries the user could read in the action log of each entity. An entity with `@ActionLogs()` fails at startup when it has no `@RequiredPermission`, or when that permission checks the scope but the entity has neither a `scope` property nor `@ScopedEntity`.
