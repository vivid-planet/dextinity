---
title: Migrating from v10 to v11
sidebar_position: -11
---

# Migrating from v10 to v11

:::info AI-Assisted Migration

This migration guide is designed to be executed by an AI coding agent (e.g., Claude Code). Each section contains structured, step-by-step instructions that an agent can follow to perform the migration automatically.

**Sample prompt to get started:**

```
Migrate this project from Dextinity v10 to v11. Follow the migration guide at https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11 step by step. Work through each section sequentially, making the required changes and running any verification commands. Commit after each major section.
```

:::

:::caution

v11 is still in development. This guide grows as breaking changes land on `next`, so check back before you start a migration.

:::

v11 upgrades MikroORM from v6 to v7, which drops APIs Dextinity and most projects rely on: the decorators move to their own package, entities can no longer be referenced by name, and the knex query runner is replaced with kysely. Only the API is affected.

The sections below cover what a Dextinity project has to change. The [MikroORM v6 to v7 upgrade guide](https://mikro-orm.io/docs/upgrading-v6-to-v7) lists every upstream change.

## API

### Update the Dextinity and MikroORM dependencies

Update all `@dextinity/*` dependencies in `api/package.json` to version `11.0.0` and the MikroORM packages to v7. `@mikro-orm/decorators` is new and has to be added — v7 no longer ships the decorators from the driver package:

```diff title="api/package.json"
{
    "dependencies": {
-       "@dextinity/cms-api": "10.0.0",
+       "@dextinity/cms-api": "11.0.0",
-       "@mikro-orm/cli": "^6.6.14",
-       "@mikro-orm/core": "^6.6.14",
-       "@mikro-orm/migrations": "^6.6.14",
-       "@mikro-orm/nestjs": "^6.1.2",
-       "@mikro-orm/postgresql": "^6.6.14",
+       "@mikro-orm/cli": "^7.2.0",
+       "@mikro-orm/core": "^7.2.0",
+       "@mikro-orm/decorators": "^7.2.0",
+       "@mikro-orm/migrations": "^7.2.0",
+       "@mikro-orm/nestjs": "^7.1.0",
+       "@mikro-orm/postgresql": "^7.2.0",
    }
}
```

Update any other Dextinity packages your project uses (e.g. `@dextinity/brevo-api`) to the same version.

Make sure the project runs on Node 22.17 or newer and TypeScript 5.8 or newer. Then install the updated dependencies:

```sh
npm install
```

### Switch to `nodenext` module resolution

MikroORM v7 uses `package.json` `exports` maps extensively. The legacy `moduleResolution: "node"` does not support them, which leads to confusing type errors — driver classes appearing incompatible with their own interfaces, for instance:

```diff title="api/tsconfig.json"
{
    "compilerOptions": {
-       "module": "commonjs",
-       "moduleResolution": "node",
+       "module": "nodenext",
+       "moduleResolution": "nodenext",
    }
}
```

`nodenext` resolves dynamic `import()` the way Node does, so relative specifiers in a dynamic import need a file extension. TypeScript maps `./foo.js` to `./foo.ts`, so append `.js`:

```diff
- const { MyStorage } = await import("./my-storage");
+ const { MyStorage } = await import("./my-storage.js");
```

The same applies to deep imports into packages, which now have to point at the emitted file:

```diff
- import type { ClassDecoratorFactory } from "@nestjs/graphql/dist/interfaces/class-decorator-factory.interface";
+ import type { ClassDecoratorFactory } from "@nestjs/graphql/dist/interfaces/class-decorator-factory.interface.js";
```

### Import the decorators from `@mikro-orm/decorators/legacy`

The decorators moved out of the driver package. Import them from `@mikro-orm/decorators/legacy` and keep everything else where it is:

```diff
- import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property, Ref } from "@mikro-orm/postgresql";
+ import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
+ import { BaseEntity, Ref } from "@mikro-orm/postgresql";
```

These symbols moved and have to be imported from `@mikro-orm/decorators/legacy`:

`AfterCreate`, `AfterDelete`, `AfterUpdate`, `AfterUpsert`, `BeforeCreate`, `BeforeDelete`, `BeforeUpdate`, `BeforeUpsert`, `Check`, `CreateRequestContext`, `Embeddable`, `Embedded`, `EnsureRequestContext`, `Entity`, `Enum`, `Filter`, `Formula`, `Index`, `ManyToMany`, `ManyToOne`, `OnInit`, `OnLoad`, `OneToMany`, `OneToOne`, `PrimaryKey`, `Property`, `ReflectMetadataProvider`, `SerializedPrimaryKey`, `Transactional`, `Trigger`, `Unique`

Find the files that need changing:

```sh
git grep -l -E "@mikro-orm/(core|postgresql|migrations)" -- api/src
```

`ReflectMetadataProvider` is no longer MikroORM's default. Projects that build their ORM config with `createOrmConfig()` get it set for them and need no change. A project that builds the config by hand has to set it explicitly, otherwise the entity metadata from `emitDecoratorMetadata` is ignored:

```diff title="api/src/db/ormconfig.ts"
+ import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
  import { defineConfig } from "@mikro-orm/postgresql";

  export default defineConfig({
+     metadataProvider: ReflectMetadataProvider,
      // ...
  });
```

### Replace name-based entity references

v7 removed entity names as references. Everywhere a name was accepted — relations, `em.find()`, `em.getRepository()`, `@InjectRepository()`, `MikroOrmModule.forFeature()` — the entity class is now required:

```diff
- await em.find("News", { id });
+ await em.find(News, { id });
```

```diff
- @ManyToOne("News")
+ @ManyToOne(() => News)
```

Where importing the class isn't possible — because it would close an import cycle, or because the entity is created at runtime by a factory such as `createFileEntity()` — use `resolveEntityClass()`. It looks the class up in MikroORM's metadata, which is populated by the time the lookup runs:

```diff
- import { News } from "./entities/news.entity";
+ import { resolveEntityClass } from "@dextinity/cms-api";
+ import type { News } from "./entities/news.entity";

- const news = await this.entityManager.findOneOrFail<News>("News", id);
+ const news = await this.entityManager.findOneOrFail(resolveEntityClass<News>("News"), id);
```

Prefer importing the class. Reach for `resolveEntityClass()` only where you can't.

### Resolve repositories through the `EntityManager`

`@InjectRepository()` resolves its injection token while the class is being defined. For an entity that is created at runtime — the DAM file and folder entities, the redirect entity — the class doesn't exist yet at that point, so the repository has to be derived from the `EntityManager` instead:

```diff
- import { InjectRepository } from "@mikro-orm/nestjs";
- import { EntityRepository } from "@mikro-orm/postgresql";
+ import { resolveEntityClass } from "@dextinity/cms-api";
+ import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";

  @Injectable()
  export class MyService {
-     constructor(@InjectRepository("DamFile") private readonly filesRepository: EntityRepository<FileInterface>) {}
+     constructor(private readonly entityManager: EntityManager) {}
+
+     private get filesRepository(): EntityRepository<FileInterface> {
+         return this.entityManager.getRepository(resolveEntityClass<FileInterface>("DamFile"));
+     }
  }
```

A resolver or service created by a factory that already receives the entity class can pass it to `@InjectRepository()` directly.

Drop the matching `MikroOrmModule.forFeature([...])` entries for entities that are no longer injected as repositories.

### Replace the removed EntityManager and MikroORM methods

```diff
- await em.persistAndFlush(entity);
+ await em.persist(entity).flush();

- await em.removeAndFlush(entity);
+ await em.remove(entity).flush();
```

The `MikroORM` extension getters were replaced by properties:

| v10                        | v11                   |
| -------------------------- | --------------------- |
| `orm.getMigrator()`        | `orm.migrator`        |
| `orm.getSchemaGenerator()` | `orm.schema`          |
| `orm.getSeeder()`          | `orm.seeder`          |
| `orm.getEntityGenerator()` | `orm.entityGenerator` |

### Replace knex with the MikroORM query APIs

v7 replaced the knex query runner with kysely, so `em.getKnex()` and `repository.getKnex()` are gone. Raw SQL goes through `Connection.execute()`, which returns the rows directly instead of a result object:

```diff
- const result = await em.getKnex().raw(`SELECT id FROM "News" WHERE "slug" = ?`, [slug]);
- return result.rows;
+ return em.execute<Array<{ id: string }>>(`SELECT id FROM "News" WHERE "slug" = ?`, [slug]);
```

Transactions that only run raw SQL use `Connection.transactional()`, which keeps them out of the ORM's unit of work the way the knex transaction did:

```diff
- await em.getKnex().transaction(async (trx) => {
-     await trx.raw(`...`);
- });
+ const connection = em.getConnection("write");
+ await connection.transactional(async (transaction) => {
+     await connection.execute(`...`, [], "run", transaction);
+ });
```

For a query builder rather than raw SQL, use `em.getKysely()`.

If your project hooked into knex's query events — for metrics, for instance — register a custom MikroORM logger instead and report from its `logQuery()`.

### Cast aggregates to their target type

v7 removed the `validate` and `strict` options and no longer coerces mismatched result types. PostgreSQL returns `COUNT()` as `bigint`, which arrives as a string and can no longer be mapped to a `number` property. This fails at runtime, not at compile time, so check every aggregate select and view entity:

```diff
- COUNT(*) AS used
+ COUNT(*)::int AS used
```

```sh
git grep -n -E "COUNT\(|SUM\(|AVG\(" -- api/src
```

### Update the ORM configuration

The `connect` option is removed — MikroORM always connects lazily now. Remove it, along with any environment variable that only existed to toggle it:

```diff title="api/src/db/ormconfig.ts"
  export const ormConfig = createOrmConfig(
      defineConfig({
-         connect: process.env.MIKRO_ORM_NO_CONNECT !== "true",
          // ...
      }),
  );
```

`driverOptions` are passed to the database client directly now, so the `connection` nesting is gone:

```diff title="api/src/db/ormconfig.ts"
  driverOptions: {
-     connection: { ssl: process.env.POSTGRESQL_USE_SSL === "true" },
+     ssl: process.env.POSTGRESQL_USE_SSL === "true",
  },
```

Environment variables no longer override options you pass explicitly. The new precedence is explicit options, then environment variables, then the config file. Set `preferEnvVars: true` to restore the old behavior.

### Update the MikroORM CLI setup

The CLI no longer supports `ts-node`. Install one of the loaders it accepts (`oxc`, `swc`, `tsx`, `jiti`, `tsimp` or `nub`) — `@swc-node/register` is the usual choice — and rename the `useTsNode` option:

```diff title="api/package.json"
{
    "devDependencies": {
+       "@swc-node/register": "^1.12.1",
    },
    "mikro-orm": {
        "configPaths": ["./src/db/ormconfig.cli.ts", "./dist/db/ormconfig.cli.js"],
-       "useTsNode": true
+       "preferTs": true
    }
}
```

`ts-node` can stay for anything else in your project that uses it.

### Regenerate the generated API files

The API Generator reads MikroORM metadata, which changed shape in v7. Regenerate and check that the output is unchanged:

```sh
cd api
npm run api-generator
git diff -- src
```

### Verify the API still starts

Type checks don't catch a broken NestJS module graph or entity metadata that fails discovery. Verify the AppModule still resolves and the generated artifacts are up to date:

```sh
cd api
npm run console -- --help
```

Then run the migrations against a database to verify the ORM connects and the entities map:

```sh
cd api
npm run db:migrate
```

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
cd api
npm run lint
```

Repeat this step, fixing all lint errors, until the lint passes.
