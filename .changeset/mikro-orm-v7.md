---
"@dextinity/api-generator": major
"@dextinity/brevo-api": major
"@dextinity/cms-api": major
---

Upgrade MikroORM to v7

MikroORM v7 requires Node 22.17+, TypeScript 5.8+ and a module resolution that understands package `exports` maps. It moves the decorators into `@mikro-orm/decorators`, removes name-based entity references, replaces the knex query runner with kysely and stops coercing mismatched result types.

Applications have to update their own code. See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required steps, and the [MikroORM v6 to v7 upgrade guide](https://mikro-orm.io/docs/upgrading-v6-to-v7) for the complete list of upstream changes.

Add `resolveEntityClass` to look an entity class up by its name, replacing the name-based references v7 removed. Use it where importing the class isn't possible, for instance when it would close an import cycle or when the entity is created at runtime by a factory such as `createFileEntity()`.

**Example**

```ts
import { resolveEntityClass } from "@dextinity/cms-api";

const news = await entityManager.findOneOrFail(resolveEntityClass<News>("News"), id);
```
