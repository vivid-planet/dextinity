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

:::caution Work in progress

v11 hasn't been released yet.
This guide grows with every breaking change that lands on [`next`](https://github.com/vivid-planet/dextinity/tree/next), so check it again once v11 is released.

:::

## Root

### Update the dependencies

Update all `@dextinity/*` dependencies in the root `package.json` to version `11.0.0`:

```diff title="package.json"
{
    "devDependencies": {
-       "@dextinity/cli": "10.6.0",
+       "@dextinity/cli": "11.0.0",
    }
}
```

:::note

`11.0.0` is illustrative. Prefer the newest stable release within the new major (e.g. `11.1.2`) and pin every `@dextinity/*` package to that same exact version:

```sh
npm view @dextinity/cms-api versions --json
```

:::

Do the same in `api/package.json`, `admin/package.json` and your site packages, then install the updated dependencies:

```sh
npm install
```

## API

### Update the MikroORM dependencies

v11 upgrades MikroORM from v6 to v7. v7 is a native ESM package that requires Node 22.17 or newer and TypeScript 5.8 or newer, and it removes a long list of APIs. The sections below cover what a Dextinity project has to change — the [MikroORM v6 to v7 upgrade guide](https://mikro-orm.io/docs/upgrading-v6-to-v7) lists every upstream change.

Update the MikroORM packages in `api/package.json` to v7. `@mikro-orm/decorators` is new and has to be added — v7 no longer ships the decorators from the driver package:

```diff title="api/package.json"
{
    "dependencies": {
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

### Update the NestJS dependencies

v11 upgrades NestJS from v11 to v12. The [NestJS migration guide](https://docs.nestjs.com/migration-guide) lists every upstream change.

```diff title="api/package.json"
{
    "dependencies": {
-       "@nestjs/apollo": "^13.4.0",
-       "@nestjs/common": "^11.1.21",
-       "@nestjs/core": "^11.1.21",
-       "@nestjs/graphql": "^13.4.0",
-       "@nestjs/jwt": "^11.0.2",
-       "@nestjs/platform-express": "^11.1.21",
+       "@nestjs/apollo": "^14.0.1",
+       "@nestjs/common": "^12.0.4",
+       "@nestjs/core": "^12.0.4",
+       "@nestjs/graphql": "^14.0.1",
+       "@nestjs/jwt": "^12.0.2",
+       "@nestjs/platform-express": "^12.0.4",
    },
    "devDependencies": {
-       "@nestjs/cli": "^11.0.21",
-       "@nestjs/testing": "^11.1.21",
+       "@nestjs/cli": "^12.0.3",
+       "@nestjs/testing": "^12.0.4",
    }
}
```

If your project uses them, `@nestjs/mapped-types` and `@nestjs/cache-manager` are versioned along with the core packages from v12 on, so they jump to `^12.0.0` as well.

```sh
npm install
```

Keep `@nestjs/schematics` on `^11.1.0` unless your project is already on TypeScript 6 — v12 of it requires `typescript >= 6.0.0`. It only backs `nest generate`; `nest build` and `nest start` don't need it, and the CLI brings its own copy.

### Allow the `@golevelup/nestjs-discovery` peer range

`@dextinity/cms-api` depends on `@golevelup/nestjs-discovery`, which has no NestJS v12 release yet — it still asks for `@nestjs/common` and `@nestjs/core` v11 as peers. It works against v12, but the install fails until the peer range is allowed:

```
npm error code ERESOLVE
npm error Could not resolve dependency:
npm error peer @nestjs/common@"^11.1.21" from @golevelup/nestjs-discovery@7.0.3
```

Override the range for that package in the root `package.json`:

```json title="package.json"
{
    "overrides": {
        "@golevelup/nestjs-discovery": {
            "@nestjs/common": "^12.0.4",
            "@nestjs/core": "^12.0.4"
        }
    }
}
```

Don't reach for `--legacy-peer-deps` or `--force` instead — both disable peer checking for the whole project, not just this package.

On pnpm, relax the check rather than rewriting the range:

```yaml title="pnpm-workspace.yaml"
peerDependencyRules:
    allowedVersions:
        "@golevelup/nestjs-discovery>@nestjs/common": "12"
        "@golevelup/nestjs-discovery>@nestjs/core": "12"
```

Remove the entry once the package ships a release that accepts v12.

### Import `repl` from `@nestjs/core`

The core packages are ESM-only from v12 on and expose their subpaths through an `exports` map that maps `@nestjs/core/<name>` to `<name>.js`. `@nestjs/core/repl` is a directory, not a file, so that specifier no longer resolves. `repl` is re-exported from the package root instead:

```diff title="api/src/repl.ts"
- import { NestFactory } from "@nestjs/core";
- import { repl } from "@nestjs/core/repl";
+ import { NestFactory, repl } from "@nestjs/core";
```

A CommonJS API keeps working: Node loads the ESM packages through `require(esm)`, which the Node version MikroORM v7 already requires supports. Switching your API to ESM is optional and not needed for v11.

### Regenerate the generated API files

The API Generator reads MikroORM metadata, which changed shape in v7. Regenerate and check that the output is unchanged:

```sh
cd api
npm run api-generator
git diff -- src
```

### Regenerate `block-meta.json`

Rich text blocks now name the link block they use in the block meta, so consumers of `block-meta.json` can tell which block the link data inside the rich text content belongs to.

Blocks created with `createRichTextBlock` use the new `RichTextBlock` field kind for their `draftContent` field instead of `Json`:

```diff title="block-meta.json"
{
    "name": "draftContent",
-   "kind": "Json",
-   "nullable": false
+   "kind": "RichTextBlock",
+   "nullable": false,
+   "linkBlock": "Link"
}
```

Blocks created with `createTipTapRichTextBlock` keep their `TipTapRichTextBlock` field kind and gain the link block next to the child blocks. It is omitted when links are disabled:

```diff title="block-meta.json"
{
    "name": "tipTapContent",
    "kind": "TipTapRichTextBlock",
    "nullable": false,
-   "childBlocks": {}
+   "childBlocks": {},
+   "linkBlock": "Link"
}
```

No source change is needed — the block factories fill in the link block on their own. Start the API once (or run any `npm run console` command) to rewrite `block-meta.json`, and commit the file if your project commits generated files:

```sh
cd api
npm run console -- --help
git diff block-meta.json
```

The generated block types don't change: rich text fields are still typed as `unknown`, so `blocks.generated.ts` stays as it is in `admin` and your site packages.

### Annotate every entity that holds block data

`block-meta.json` no longer contains every block that was created somewhere in the application. It now contains the blocks the application actually uses: the root blocks found on your entities and, recursively, every block they reference. Blocks a library creates on import are gone from it, and so are the types that were generated for them.

Root blocks are discovered from the entities, so every entity holding block data needs `@RootBlockEntity()` on the class and `@RootBlock(ExampleBlock)` on each column containing block data. Previously this was only needed for the [block index](../2-core-concepts/7-dependencies/index.md) — an entity without it still made it into `block-meta.json`.

```diff title="api/src/news/entities/news.entity.ts"
+ @RootBlockEntity()
  @Entity()
  export class News extends BaseEntity {
+     @RootBlock(NewsContentBlock)
      @Property({ type: new RootBlockType(NewsContentBlock) })
      @Field(() => RootBlockDataScalar(NewsContentBlock))
      content: BlockDataInterface;
  }
```

Then regenerate the file and review which blocks disappeared:

```sh
cd api
npm run console -- --help
git diff block-meta.json
```

A block that disappears is one the application doesn't reach from an entity. Add the missing annotations for the blocks you do use. For the ones you don't, `blocks.generated.ts` in `admin` and your site packages loses their types — delete the code that referenced them.

### Replace `getRegisteredBlocks()` and `registerBlock()`

Blocks are no longer registered as a side effect of `createBlock`, and both functions are removed. Only projects that called them are affected, for instance a script that generates a block meta of its own.

Name the blocks to generate the meta for instead. `getBlocksMeta()` requires them and returns their meta together with the meta of every block they reference, so the root blocks are enough:

```diff title="api/generate-block-meta.ts"
- const metaJson = getBlocksMeta();
+ const metaJson = getBlocksMeta([PageContentBlock, SeoBlock]);
```

### Update custom `block-meta.json` consumers

Only projects that read `block-meta.json` themselves are affected — for instance a [custom client](../4-guides/1-how-to-build-a-custom-client/index.md) or a script that walks the block tree.

**Switch to `@dextinity/cli` if you can.** Its `generate-block-types` command turns `block-meta.json` into TypeScript types for you and already knows the new field kind, so every future block meta change arrives with the package update instead of becoming a migration step of its own:

```json title="package.json"
{
    "scripts": {
        "generate-block-types": "dextinity generate-block-types"
    }
}
```

See [How to build a custom client](../4-guides/1-how-to-build-a-custom-client/index.md#block-metadata) for the full setup. `recursivelyLoadBlockData` from `@dextinity/site-react` handles the new field kind as well.

If your project has to keep its own consumer, handle the new kind wherever you switch on a field's `kind` — rich text fields of Draft.js-based rich text blocks previously appeared as `kind: "Json"` and now appear as `kind: "RichTextBlock"`:

```diff
- if (field.kind === "Json") {
+ if (field.kind === "Json" || field.kind === "RichTextBlock") {
      // …
  }
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

## Agent features

### Get the `dev-pm` skill from `dev-process-manager`

The `dev-pm` skill is no longer shipped by `@dextinity/agent-features`. It now comes with `dev-process-manager` itself, so it stays in sync with the tool it documents.

Update `dev-process-manager` to at least `4.1.0` and reinstall the agent features:

```sh
npm install --save-dev dev-process-manager@^4.1.0
npx @dextinity/cli install-agent-features
```

`install-agent-features` discovers the skill in `node_modules/dev-process-manager/skills/` and symlinks it into `.agents/skills/` and `.claude/skills/` as before, so nothing else changes for agents.

If you don't update `dev-process-manager`, remove the stale copy so agents don't load an outdated version:

```sh
rm -rf .agents/skills/dev-pm .claude/skills/dev-pm
```

The other skills, the rules under `rules/coding-guidelines/` and the `agent-features.json` format are unchanged.
