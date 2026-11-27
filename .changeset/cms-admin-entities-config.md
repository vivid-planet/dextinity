---
"@dextinity/cms-admin": major
---

Register entities with the new `entities` option of `DextinityConfigProvider`

The `dependencies.entityDependencyMap` option has been removed. Pass the same entries to `entities` instead. Renaming your own constants, such as `NewsDependency` to `NewsEntity`, is optional:

```diff
<DextinityConfigProvider
-   dependencies={{
-       entityDependencyMap: {
-           Page,
-           News: NewsDependency,
-           DamFile: createDamFileDependency(),
-       },
-   }}
+   entities={{
+       Page,
+       News: NewsEntity,
+       DamFile: createDamFileEntity(),
+   }}
>
```

Besides the dependencies, the entries are used by the warnings, the DAM, the image block and the full text search. Each entry implements the new `EntityInterface`, which adds an optional `icon` to `displayName` and `resolvePath`.

These exports are renamed. The old names remain as deprecated aliases until version 12:

- `DependencyInterface` → `EntityInterface`
- `createDependencyMethods` → `createEntityMethods`
- `createDocumentDependencyMethods` → `createDocumentEntityMethods`
- `createDamFileDependency` → `createDamFileEntity`

Use `useEntity(entityName)` or `useEntitiesConfig()` to read the registered entities in your own components.

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required changes.
