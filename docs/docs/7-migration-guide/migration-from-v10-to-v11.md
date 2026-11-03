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

### Update Node to v24

v11 requires Node 24.15 or newer. Update the Node version wherever your project sets it, for example in `.nvmrc`, the `engines` field of the `package.json` files, Dockerfiles and the CI configuration:

```diff title=".nvmrc"
- 22
+ 24
```

```diff title="package.json"
{
    "engines": {
-       "node": "22"
+       "node": ">=24.15.0"
    }
}
```

```diff title="api/Dockerfile"
- FROM node:22
+ FROM node:24
```

Check that your local Node version is 24.15 or newer before installing the dependencies:

```sh
node --version
```

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

## Linting

### Remove the `@calm/react-intl/missing-formatted-message` ESLint rule

`@dextinity/eslint-config` no longer bundles the deprecated [`@calm/eslint-plugin-react-intl`](https://www.npmjs.com/package/@calm/eslint-plugin-react-intl) plugin. Enforcing that user-facing strings are masked with `<FormattedMessage />` is now covered by [`react/jsx-no-literals`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-literals.md), which the config already enables.

Because the rule no longer exists, any project that still references it fails linting: a rule override throws `Definition for rule '@calm/react-intl/missing-formatted-message' was not found`, and a disable comment becomes an unused-directive report (an error under `--max-warnings 0`).

Remove the rule from your own ESLint config(s). Find the overrides:

```sh
git grep -n "@calm/react-intl/missing-formatted-message" -- "*eslint.config*" ".eslintrc*"
```

```diff title="eslint.config.mjs"
  {
      files: ["**/*.stories.tsx", "**/*.test.tsx"],
      rules: {
-         "@calm/react-intl/missing-formatted-message": "off",
          "react/jsx-no-literals": "off",
      },
  },
```

Then update the inline disable comments. Find them:

```sh
git grep -n "@calm/react-intl/missing-formatted-message"
```

Drop the rule from each `eslint-disable*` comment. If it was combined with `react/jsx-no-literals`, keep that one; if it was the only rule listed, remove the whole comment:

```diff
- {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message,react/jsx-no-literals */}
+ {/* eslint-disable-next-line react/jsx-no-literals */}
```

Finally, if your project's `package.json` depends on `@calm/eslint-plugin-react-intl` directly (it was previously pulled in transitively through `@dextinity/eslint-config`), remove it:

```sh
npm uninstall @calm/eslint-plugin-react-intl
```

:::note

`react/jsx-no-literals` covers untranslated JSX text, but the removed rule's `enforceLabels` option additionally flagged some string attributes (such as `label`, `title` and `placeholder`). Those are no longer enforced automatically — review any remaining untranslated attribute strings manually.

:::

### Verify lint passes

```sh
npm run lint
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

The API Generator loads the entities with the same loader, so the loader also has to support decorator metadata. `@swc-node/register` does; `tsx` doesn't.

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

`@nestjs/schematics` is left out above because v12 of it requires `typescript >= 6.0.0`. Keeping it on `^11.1.0` is fine: it only backs `nest generate`, which `nest build` and `nest start` don't need, and the CLI brings its own copy.

#### Optional: upgrade to TypeScript 6

Upgrade TypeScript along with it to move `@nestjs/schematics` to v12 as well:

```diff title="api/package.json"
{
    "devDependencies": {
-       "@nestjs/schematics": "^11.1.0",
-       "typescript": "^5.9.3",
+       "@nestjs/schematics": "^12.0.6",
+       "typescript": "^6.0.3",
    }
}
```

TypeScript 6 turns the deprecated `baseUrl` option into an error and requires an explicit `rootDir` next to `outDir`:

```diff title="api/tsconfig.json"
{
    "compilerOptions": {
-       "baseUrl": "./",
        "paths": {
-           "@src/*": ["src/*"]
+           "@src/*": ["./src/*"]
        },
+       "rootDir": "./src",
    }
}
```

`rootDir` has to stay at `./src`: with `.`, `src/main.ts` compiles to `dist/src/main.js`, and `start:prod` no longer finds the entry point. Widen it again in the configs that type-check files outside `src`:

```diff title="api/tsconfig.lint.json"
{
    "compilerOptions": {
+       "rootDir": "./"
    }
}
```

Without `baseUrl`, `paths` entries resolve relative to the `tsconfig.json`, so they need a leading `./`, and `tsconfig-paths` has to be v4 — v3 doesn't resolve them.

### Override the `@golevelup/nestjs-discovery` version on pnpm

Skip this section when your project uses npm or yarn — nothing is needed there.

`nest-commander` pins `@golevelup/nestjs-discovery` at `7.0.3`, which still asks for NestJS v11 as a peer. It works against v12, and npm installs it as a nested copy with a warning. pnpm with `strictPeerDependencies` fails instead, so pin it to a release that accepts v12:

```yaml title="pnpm-workspace.yaml"
overrides:
    "nest-commander>@golevelup/nestjs-discovery": "^7.1.0"
```

Remove the entry once `nest-commander` ships a release that depends on `7.1.0` or newer.

### Import `repl` from `@nestjs/core`

The core packages are ESM-only from v12 on and expose their subpaths through an `exports` map that maps `@nestjs/core/<name>` to `<name>.js`. `@nestjs/core/repl` is a directory, not a file, so that specifier no longer resolves. `repl` is re-exported from the package root instead:

```diff title="api/src/repl.ts"
- import { NestFactory } from "@nestjs/core";
- import { repl } from "@nestjs/core/repl";
+ import { NestFactory, repl } from "@nestjs/core";
```

A CommonJS API keeps working: Node loads the ESM packages through `require(esm)`, which the Node version MikroORM v7 already requires supports. Switching your API to ESM is optional and not needed for v11.

### Update `graphql-scalars` to v2

`@dextinity/cms-api` and `@dextinity/brevo-api` now have `graphql-scalars` v2 as a peer dependency, so they use the same copy as your API. Most projects already depend on it for the code generated by the API Generator. Update it to v2, or add it if `api/package.json` doesn't list it yet:

```diff title="api/package.json"
{
    "dependencies": {
-       "graphql-scalars": "^1.26.0",
+       "graphql-scalars": "^2.0.1",
    }
}
```

```sh
npm install
```

v2 drops support for `graphql` below v16 and for Node 20, which v11 doesn't support either. The scalars themselves are unchanged.

### Replace deep imports into the API packages

`@dextinity/cms-api`, `@dextinity/brevo-api` and `@dextinity/api-generator` only expose their package root through an `exports` map, so imports of their internals no longer resolve. Import from the package root instead:

```diff
- import { CombinedPermission } from "@dextinity/cms-api/lib/user-permissions/user-permissions.types";
+ import { CombinedPermission } from "@dextinity/cms-api";
```

If something you need isn't exported from the package root, open an issue.

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

## Admin

### Update `react-intl` to v12

The admin packages now require `react-intl` v12. Older versions declare a peer dependency on TypeScript 5, which blocks the update to TypeScript 6.

Update `react-intl` in `admin/package.json`:

```sh
cd admin
npm install react-intl@^12.1.2
```

If your API or site packages use `react-intl` as well, update them to the same version so the whole project shares one `react-intl` version. If you use `@formatjs/cli` to extract messages, update it to the latest 6.x version as well.

`react-intl` v12 requires React 18 or later, so the admin packages no longer support React 16 and 17. If your admin still uses one of them, update `react` and `react-dom` to v18 or v19 first.

`react-intl` v12 is ESM-only. Bundlers (Vite, Next.js) handle this on their own. A CommonJS API (e.g., NestJS) loads it via `require()`, which the required Node.js version supports.

#### Replace deep imports

`react-intl` no longer allows imports from its internal files. Import from the package root instead:

```diff
- import { FormattedMessage } from "react-intl/lib";
+ import { FormattedMessage } from "react-intl";
```

#### Declare the values of predefined messages

Messages created with `defineMessage` or `defineMessages` are typed now. Without a type parameter, a message accepts no values, so passing values to it fails to compile:

```
Type 'number' is not assignable to type 'never'.
```

Messages written inline in `<FormattedMessage>` or `intl.formatMessage()` aren't affected.

Find the predefined messages that take values — the ones whose `defaultMessage` contains a placeholder (`{name}`) or a rich text tag (`<strong>`):

```sh
grep -rn -A3 "defineMessages\?(" src
```

Declare their values as a type parameter. Rich text tags use `MessageTag`:

```diff
- import { defineMessage } from "react-intl";
+ import { defineMessage, type MessageTag } from "react-intl";

- const headingMessage = defineMessage({ id: "heading", defaultMessage: "Heading {level}" });
+ const headingMessage = defineMessage<{ level: number }>({ id: "heading", defaultMessage: "Heading {level}" });

- const errorMessage = defineMessage({ id: "error", defaultMessage: "<strong>Error:</strong> {message}" });
+ const errorMessage = defineMessage<{ strong: MessageTag; message: string }>({
+     id: "error",
+     defaultMessage: "<strong>Error:</strong> {message}",
+ });
```

The type parameter of `defineMessages` must list every message of the call. If only some of them take values, move those into a `defineMessages` call of their own:

```diff
- const messages = defineMessages({
-     save: { id: "save", defaultMessage: "Save" },
-     greeting: { id: "greeting", defaultMessage: "Hello {name}" },
- });
+ const messages = {
+     ...defineMessages({
+         save: { id: "save", defaultMessage: "Save" },
+     }),
+     ...defineMessages<{ greeting: { name: string } }>({
+         greeting: { id: "greeting", defaultMessage: "Hello {name}" },
+     }),
+ };
```

Moving messages between calls doesn't change their IDs, so the extracted messages and the translations stay the same.

:::note

When typed messages are exported from code that emits declaration files (e.g., a shared library), TypeScript reports `TS2742: The inferred type of '…' cannot be named`. Annotate them with `TypedMessageDescriptor`:

```ts
const greetingMessages: { greeting: TypedMessageDescriptor<{ name: string }> } = defineMessages<{
    greeting: { name: string };
}>({
    greeting: { id: "greeting", defaultMessage: "Hello {name}" },
});
```

:::

Then verify that the messages still extract:

```sh
cd admin
npm run intl:extract
```

### Stop reading `__typename` from the file upload fragments

`GQLFinalFormFileUploadFragment` and `GQLFinalFormFileUploadDownloadableFragment` no longer have a `__typename` field.

Find the usages:

```sh
grep -rn "GQLFinalFormFileUpload\(Downloadable\)\?Fragment" src
```

Where your code reads `__typename` from a value of one of these types, select `__typename` in your own query and use that query's type instead.

### Update MUI to v9

The admin packages now require MUI v9 and MUI X v9. See the [Material UI](https://mui.com/material-ui/migration/upgrade-to-v9/), [Data Grid](https://mui.com/x/migration/migration-data-grid-v8/) and [Date and Time Pickers](https://mui.com/x/migration/migration-pickers-v8/) migration guides for the complete list of changes.

Update every `@mui/*` dependency in `admin/package.json`: `@mui/material`, `@mui/system` and `@mui/utils` to `^9.5.0`, and the MUI X packages (`@mui/x-data-grid`, `@mui/x-data-grid-pro`, `@mui/x-data-grid-premium`, `@mui/x-date-pickers`, `@mui/x-date-pickers-pro`, `@mui/x-license`) to `^9.15.0`:

```diff title="admin/package.json"
{
    "dependencies": {
-       "@mui/material": "^7.3.11",
-       "@mui/system": "^7.3.11",
-       "@mui/x-data-grid-pro": "^8.29.3",
-       "@mui/x-date-pickers": "^8.29.4",
+       "@mui/material": "^9.5.0",
+       "@mui/system": "^9.5.0",
+       "@mui/x-data-grid-pro": "^9.15.0",
+       "@mui/x-date-pickers": "^9.15.0",
    }
}
```

```sh
cd admin
npm install
```

The default browser targets of MUI v9 are Chrome 117, Edge 121, Firefox 121 and Safari 17.

#### Run the codemods

MUI v9 removes the system props, the deprecated component props (`PaperProps`, `TransitionComponent`, `inputProps`, …) and the deprecated CSS classes. Migrate them with the codemods:

```sh
cd admin
npx @mui/codemod@9.4.0 v9.0.0/system-props src
npx @mui/codemod@9.4.0 deprecations/all src
npx @mui/x-codemod@latest v9.0.0/preset-safe src
```

:::note

`@mui/codemod` 9.5.0 fails to start with `TypeError: yargs.command is not a function`. Version 9.4.0 contains the same v9 codemods.

:::

The codemods also rewrite the files in `generated/` folders. Instead of keeping these changes, regenerate the files with the Admin Generator afterwards:

```sh
cd admin
npx dextinity-admin-generator generate
```

Then type-check the admin and fix the remaining errors with the following steps:

```sh
cd admin
npx tsc --noEmit
```

#### Replace the removed keys in the theme

The codemods only rewrite class selectors such as `.MuiButton-containedPrimary`. Keys of `styleOverrides` that MUI v9 removed (e.g., `containedPrimary`, `iconSizeMedium`, `outlinedSuccess`, `paperScrollPaper`, `inputMultiline`, `inputAdornedStart`) fail to compile. Move their styles into the remaining key of the variant and target the color, size or slot with a compound selector:

```diff
+ import { buttonClasses } from "@mui/material";

  styleOverrides: {
-     containedPrimary: {
-         backgroundColor: palette.primary.main,
-     },
+     contained: {
+         [`&.${buttonClasses.colorPrimary}`]: {
+             backgroundColor: palette.primary.main,
+         },
+     },
  },
```

Styles of a slot that depend on the state of the root (e.g., `inputAdornedStart` of `MuiInputBase`) move into the key of the slot and target the root class:

```diff
  styleOverrides: {
-     inputAdornedStart: {
-         paddingLeft: spacing(2),
-     },
+     input: {
+         [`.${inputBaseClasses.adornedStart} &`]: {
+             paddingLeft: spacing(2),
+         },
+     },
  },
```

#### Replace the removed props the codemods miss

The codemods only migrate props written as JSX attributes of MUI components. Replace the removed props in all other places by hand, for instance in `slotProps` objects, in props of Dextinity components that are passed on to MUI components, and on components the codemods don't cover (e.g., `DialogTitle` or components created with `styled()`):

```sh
grep -rnE "PaperProps|MenuListProps|TransitionComponent|BackdropComponent|InputProps|InputLabelProps|primaryTypographyProps|ScrollButtonComponent|componentsProps" src --include="*.tsx" --exclude-dir=generated
```

```diff
  <Dialog
      slotProps={{
          root: {
-             PaperProps: { sx: { height: "100%" } },
+             slotProps: { paper: { sx: { height: "100%" } } },
          },
      }}
  />
```

The following Dextinity props passed on removed MUI props and changed accordingly:

| Component                | Before                                                                     | After                                                                                             |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ToolbarBreadcrumbs`     | `slotProps.mobileMenu.MenuListProps`<br/>`slotProps.mobileMenu.PaperProps` | `slotProps.mobileMenu.slotProps.list`<br/>`slotProps.mobileMenu.slotProps.paper`                  |
| `MainNavigation`         | `slotProps.permanentDrawer.PaperProps`                                     | `slotProps.permanentDrawer.slotProps.paper`                                                       |
| `FilterBarPopoverFilter` | `slotProps.popover.PaperProps`                                             | `slotProps.popover.slotProps.paper`                                                               |
| `Tabs`                   | `ScrollButtonComponent`                                                    | `slots.scrollButtons`                                                                             |
| `RouterTabs`             | `tabsProps.ScrollButtonComponent`                                          | `tabsProps.slots.scrollButtons`                                                                   |
| `InputWithPopper`        | `components` with the slots of the input                                   | `components` only accepts `Transition`, pass the slots of the input with `slots`                  |
| `ColorPicker`            | `components` with the slots of the input                                   | `components` only accepts `Transition` and the previews, pass the slots of the input with `slots` |
| `RowActionsSubMenu`      | `componentsProps` with the slot props of the menu                          | `slotProps`                                                                                       |

#### Pass the input props of the `Autocomplete` with the slot props

The params of `renderInput` of the `Autocomplete` contain `slotProps.input`, `slotProps.htmlInput` and `slotProps.inputLabel` instead of `InputProps`, `inputProps` and `InputLabelProps`. A `TextField` accepts these slot props, so spreading the params still works. If you pass `slotProps` to the `TextField` as well, merge them with the params. Otherwise, the props of the `<input>` are lost and the `Autocomplete` stops working:

```diff
  renderInput={(params) => (
      <TextField
          {...params}
          slotProps={{
+             ...params.slotProps,
              input: {
-                 ...params.InputProps,
+                 ...params.slotProps.input,
                  endAdornment: (
                      <>
                          <ClearInputAdornment position="end" onClick={handleClear} />
-                         {params.InputProps.endAdornment}
+                         {params.slotProps.input.endAdornment}
                      </>
                  ),
              },
          }}
      />
  )}
```

An `InputBase` doesn't accept these slot props. Pass the input props to it and the props of the `<input>` with `slotProps.input`:

```diff
- renderInput={({ InputProps, ...params }) => <InputBase {...params} {...InputProps} />}
+ renderInput={({ slotProps: { input: inputProps, htmlInput: htmlInputProps }, ...params }) => (
+     <InputBase {...params} {...inputProps} slotProps={{ input: htmlInputProps }} />
+ )}
```

TypeScript doesn't catch an overridden `slotProps`, so check every `renderInput` of your project:

```sh
grep -rn "renderInput" src
```

#### Render buttons that link to a stack page with `nativeButton={false}`

In development, MUI v9 logs an error when a `Button` or `IconButton` renders a custom component that isn't a `<button>`, unless it has a `to` or `href` prop. This applies to buttons rendered with `StackLink`. Add `nativeButton={false}` to them:

```diff
- <IconButton component={StackLink} pageName="edit" payload={row.id}>
+ <IconButton component={StackLink} nativeButton={false} pageName="edit" payload={row.id}>
```

```sh
grep -rn "component={StackLink}" src --exclude-dir=generated
```

The Admin Generator adds `nativeButton={false}` to the files it generates.

#### Update the tests of Data Grids

The column headers of the Data Grid have the `rowgroup` role now. Queries such as `getByRole("rowgroup")` find two elements, so exclude the column headers:

```ts
const bodyRowgroup = rendered
    .getAllByRole("rowgroup")
    .find((rowgroup) => !rowgroup.classList.contains(gridClasses.columnHeaders));
```

The details passed to the callbacks of the Data Grid require `apiRef` now. Add it where your tests call these callbacks:

```diff
- onSortModelChange(sortModel, { api });
+ onSortModelChange(sortModel, { api, apiRef: { current: api } });
```

#### Regenerate the MUI X license key

MUI X v9 requires a new license key for the Pro and Premium packages. Regenerate it in the [MUI Store](https://mui.com/store/) and replace the key wherever your project sets it, for example, in the environment variables of the admin.

### Update React Router to v8

The admin packages now require React Router v8 instead of v5. Your app uses the native React Router v8 APIs (`<Routes>`, `<Route element>`, `<Navigate>`, `useNavigate`, relative routes), and the Dextinity router components work inside them. There's no compatibility layer for the v5 APIs, so every routing call of your admin has to be migrated.

Work through the following steps in order. Type-check after each step:

```sh
cd admin
npx tsc --noEmit
```

TypeScript doesn't catch every change: a route path that no longer matches renders nothing. Check the pages of your admin in the browser after migrating.

#### Update the React Router dependencies

React Router v8 is a single package. `react-router-dom`, `history` and the `@types/*` packages aren't needed anymore. React Router v8 requires React 19.2.7, so the admin packages require `react` and `react-dom` `^19.2.7` now.

```sh
cd admin
npm uninstall react-router-dom history @types/react-router @types/react-router-dom @types/history
npm install react-router@^8.5.1 react@^19.2.7 react-dom@^19.2.7
```

```diff title="admin/package.json"
{
    "dependencies": {
-       "react": "^19.0.0",
-       "react-dom": "^19.0.0",
-       "react-router": "^5.3.4",
-       "react-router-dom": "^5.3.4",
+       "react": "^19.2.7",
+       "react-dom": "^19.2.7",
+       "react-router": "^8.5.1",
    },
    "devDependencies": {
-       "@types/history": "^4.7.11",
-       "@types/react-router": "^5.1.20",
-       "@types/react-router-dom": "^5.3.3",
    }
}
```

Remove `history` and the `@types/react-router*` packages from any other package of your project that only used them for the admin.

#### Import everything from `react-router`

Replace all imports from `react-router-dom` and `history` with imports from `react-router`:

```sh
grep -rnE "from \"(react-router-dom|history)\"" src
```

```diff
- import { Link, useHistory } from "react-router-dom";
- import type { Location, Action } from "history";
+ import { Link, useNavigate } from "react-router";
+ import type { Location, NavigationType } from "react-router";
```

The `Action` type of `history` is `NavigationType` in React Router v8. It's a string enum (`"POP"`, `"PUSH"`, `"REPLACE"`), so comparisons with string literals still compile.

#### Migrate the routing of your app

Replace the v5 APIs with their v8 counterparts:

| React Router v5                                                       | React Router v8                                                                                                         |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `<Switch>`                                                            | `<Routes>`                                                                                                              |
| `<Route path="/products" component={Products} />`                     | `<Route path="products/*" element={<Products />} />`                                                                    |
| `<Route path="/products" render={(props) => <Products {...props} />}` | `<Route path="products/*" element={<Products />} />`, read the route data with hooks                                    |
| `<Route exact path="/products">`                                      | `<Route path="products">` (routes match exactly by default)                                                             |
| `<Route path="/products">{({ match }) => …}</Route>`                  | `useMatch({ path: "/products", end: false })`                                                                           |
| `<Redirect to="/products" />`                                         | `<Navigate to="/products" replace />`                                                                                   |
| `<Redirect exact from="/" to="/products" />` inside `<Switch>`        | `<Route index element={<Navigate to="/products" replace />} />`                                                         |
| `history.push(url)` (from `useHistory()`)                             | `navigate(url)` (from `useNavigate()`)                                                                                  |
| `history.replace(url)`                                                | `navigate(url, { replace: true })`                                                                                      |
| `history.goBack()`                                                    | `navigate(-1)`                                                                                                          |
| `history.listen(callback)`                                            | `useLocation()` and `useNavigationType()` in an effect                                                                  |
| `useRouteMatch()` (without arguments)                                 | `useCurrentRouteMatch()` from `@dextinity/admin`, see [below](#replace-the-route-match-in-pages-blocks-and-dialogs)     |
| `useRouteMatch("/products/:id")`                                      | `useMatch({ path: "/products/:id", end: false })`                                                                       |
| `matchPath(pathname, { path, exact })`                                | `matchPath({ path, end: exact }, pathname)` (the arguments are swapped, and `end` defaults to `true`)                   |
| `withRouter`, `RouteComponentProps`                                   | `useLocation()`, `useNavigate()` and `useParams()`                                                                      |
| `<Prompt>`, `history.block()`                                         | `RouterPrompt` from `@dextinity/admin`. Never use `useBlocker` or `unstable_usePrompt`, see [below](#update-the-router) |
| `<Link to={(location) => …}>`, `<Link innerRef>`, `<Link component>`  | `<Link to="…">` with a string or object, `<Link ref>`                                                                   |
| `<NavLink exact activeClassName="active">`                            | `<NavLink end className={({ isActive }) => …}>`                                                                         |

Find the usages:

```sh
grep -rnE "\b(Switch|Redirect|useHistory|useRouteMatch|withRouter|RouteComponentProps|Prompt|NavLink|matchPath|history)\b|<Route\b" src --include="*.tsx" --include="*.ts" --exclude-dir=generated
```

Follow these rules when migrating the routes:

1. **Nested route paths are relative.** A `<Routes>` inside another route matches the URL below that route. Absolute paths only match where the enclosing route is at the root URL `/`, e.g., at the top level of the router. Below a route, and inside a `StackPage`, `RouterTab`, `EditDialog` or the children of `ContentScopeProvider`, an absolute path or a path built from `match.url` or `match.path` silently matches nothing. Use relative paths instead.
2. **A route that renders further routing needs a trailing `/*`.** This applies to every route whose element contains `<Routes>`, `Stack`, `StackSwitch`, `RouterTabs`, `EditDialog` or `MasterMenuRoutes`. Without it, only the exact URL of the route matches and the sub pages stay blank.
3. **`<Routes>` ranks its routes by specificity.** v5's `<Switch>` rendered the first match, so the order of the routes no longer matters. A catch-all `*` route only renders when nothing else matches.

```diff
- import { Redirect, Route, Switch, useRouteMatch } from "react-router";
+ import { Navigate, Route, Routes } from "react-router";

  function ProductsRoutes() {
-     const match = useRouteMatch();
      return (
-         <Switch>
-             <Route path={`${match.path}/variants`} component={VariantsPage} />
-             <Route path={`${match.path}/list`} render={() => <ProductsPage />} />
-             <Redirect to={`${match.url}/list`} />
-         </Switch>
+         <Routes>
+             <Route path="variants/*" element={<VariantsPage />} />
+             <Route path="list/*" element={<ProductsPage />} />
+             <Route index element={<Navigate to="list" replace />} />
+         </Routes>
      );
  }
```

Relative links and navigations also work inside the Dextinity router components now: in a `StackPage`, a `RouterTab`, the content of an `EditDialog` and the initial page of a `StackSwitch`, `<Link to="details">` resolves below the URL of the page, `".."` goes to the parent URL, and `useParams()` returns the params of the parent routes plus the `id` of the page or selection.

#### Update the router

`RouterBrowserRouter` and `RouterMemoryRouter` are React Router data routers now and include the `RouterPromptHandler`. Their props changed:

| Component             | Before                                                                                        | After                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `RouterBrowserRouter` | v5 `BrowserRouterProps` (`basename`, `getUserConfirmation`, `forceRefresh`, `keyLength`)      | `RouterBrowserRouterProps`: `basename`                                  |
| `RouterMemoryRouter`  | v5 `MemoryRouterProps` (`initialEntries`, `initialIndex`, `getUserConfirmation`, `keyLength`) | `RouterMemoryRouterProps`: `initialEntries`, `initialIndex`, `basename` |

```diff
- <RouterBrowserRouter basename="/admin" getUserConfirmation={getUserConfirmation}>
+ <RouterBrowserRouter basename="/admin">
```

The confirmation dialog for `RouterPrompt` is always built in. The props are only read when the router is created.

- Don't render a React Router router (`<Router history>`, `<BrowserRouter>`, `<MemoryRouter>`, `<HashRouter>`, `unstable_HistoryRouter`) inside or around the Dextinity routers. React Router v8 throws when routers are nested.
- For a router inside another router, for instance in a dialog with its own navigation, use `<RouterMemoryRouter>`. It can be nested and isolates its location, routes, `SubRoute`s and prompts from the outer router: its `RouterPrompt`s only block its own navigations. Inside it, `useContentScope()` returns an empty scope, so read the scope outside and pass it in.
- `RouterPromptHandler` no longer takes an `apiRef` and renders the confirmation dialog itself. It only works inside a data router, which `RouterBrowserRouter` and `RouterMemoryRouter` already include. If you combined a React Router router with your own `RouterPromptHandler`, replace both with `RouterBrowserRouter` or `RouterMemoryRouter`.
- Don't call `useBlocker` or `unstable_usePrompt` in your app. A data router supports only one blocker, and the `RouterPromptHandler` owns it. Use `RouterPrompt` instead.
- The data APIs of React Router (loaders, actions, `useLoaderData`, route handles) aren't available, because the routes of your app are descendant `<Routes>`.

```sh
grep -rnE "\b(BrowserRouter|MemoryRouter|HashRouter|HistoryRouter|getUserConfirmation|useBlocker|unstable_usePrompt|RouterPromptHandler)\b" src
```

#### Update the `RouterPrompt` messages

The `message` of `RouterPrompt` receives the `Location` and `NavigationType` of React Router instead of the types of `history`:

```diff
- import type { Action, Location } from "history";
+ import type { Location, NavigationType } from "react-router";

  <RouterPrompt
-     message={(location: Location, action: Action) => {
+     message={(location: Location, action: NavigationType) => {
          if (location.pathname.startsWith(routeUrl)) {
              return true;
          }
          return intl.formatMessage({ id: "editPage.discardChanges", defaultMessage: "Discard unsaved changes?" });
      }}
  />
```

`location.state` is typed `any`, and `location.key` is always set. Returning `false` still blocks the navigation without showing a dialog.

If you register prompts directly with the exported `RouterContext`, its `register()` options use the same types, and `path` is optional now.

#### Update `ForcePromptRoute`, `SubRouteIndexRoute` and `RouteWithErrorBoundary`

React Router v8's `<Routes>` only accepts `<Route>` children, so these components are no longer routes.

`ForcePromptRoute` takes an absolute `path` that matches non-exactly and renders its children while it matches. `exact`, `component`, `render` and children functions are removed:

```diff
- <ForcePromptRoute path={`${urlPrefix}/:id/edit`} exact render={() => <EditForm />} />
+ <ForcePromptRoute path={`${urlPrefix}/:id/edit`}>
+     <EditForm />
+ </ForcePromptRoute>
```

The children function of `SubRouteIndexRoute` receives `{ match }`, a React Router `PathMatch` or `null`, instead of the v5 route props. Use `match.pathnameBase` instead of `match.url`:

```diff
  <SubRouteIndexRoute>
-     {({ match }) => <ProductsGrid url={match?.url} />}
+     {({ match }) => <ProductsGrid url={match?.pathnameBase} />}
  </SubRouteIndexRoute>
```

`RouteWithErrorBoundary` wraps the element of a route now and takes the props of `ErrorBoundary`. The error resets when navigating to another route:

```diff
- <Switch>
-     <RouteWithErrorBoundary path="/products" component={Products} />
- </Switch>
+ <Routes>
+     <Route
+         path="products/*"
+         element={
+             <RouteWithErrorBoundary>
+                 <Products />
+             </RouteWithErrorBoundary>
+         }
+     />
+ </Routes>
```

```sh
grep -rnE "\b(ForcePromptRoute|SubRouteIndexRoute|RouteWithErrorBoundary)\b" src --exclude-dir=generated
```

#### Update the links

`StackLink` and `MainNavigationItemRouterLink` are based on React Router v8's `Link`:

- `innerRef` and `component` are removed. Use `ref`.
- The function form of `to` is removed from `MainNavigationItemRouterLink`. A relative `to` resolves against the current route, both for the link and its selected state.
- The selected state of `MainNavigationItemRouterLink` and the auto-opening of `MainNavigationCollapsibleItem` still match the URL as a prefix. A search or hash in `to` no longer breaks the matching, and the trailing slash no longer matters.
- The `link`, `overflowLink` and `backButton` slots of `StackBreadcrumbs`, the `link` slot of `ToolbarBreadcrumbs` and `slotProps.iconButton` of `ToolbarBackButton` take the props of React Router v8's `Link`. The `link` slot of `StackBreadcrumbs` renders the `Link` directly. It no longer nests a `BreadcrumbLink` and no longer writes a `variant` attribute to the `<a>`, so adjust styles that target them.

```diff
- <StackLink pageName="edit" payload={id} innerRef={linkRef}>
+ <StackLink pageName="edit" payload={id} ref={linkRef}>
```

```sh
grep -rnE "innerRef|MainNavigationItemRouterLink|StackBreadcrumbs|ToolbarBreadcrumbs|ToolbarBackButton" src --exclude-dir=generated
```

#### Replace the route match in pages, blocks and dialogs

Code that read the v5 route match inside a `StackPage`, `RouterTab`, `EditDialog`, the initial page of a `StackSwitch` or a master menu route uses `useCurrentRouteMatch()` from `@dextinity/admin` now. It returns `{ url, pattern }` or `null`: `url` corresponds to v5's `match.url`, and `pattern` to v5's `match.path`. Like v5's `useRouteMatch()`, it ignores `SubRoute`s. Use `useSubRoutePrefix()` where you need the `SubRoute`s included.

This affects, for instance, the `parentUrl` of the `BlockContext` in edit pages of documents and custom blocks:

```diff
- import { useRouteMatch } from "react-router";
+ import { useCurrentRouteMatch } from "@dextinity/admin";
+ import { matchPath, useLocation } from "react-router";

- const match = useRouteMatch();
- const tabRouteMatch = useRouteMatch<{ tab: string }>(`${match.path}/:tab`);
+ const routeUrl = useCurrentRouteMatch()?.url ?? "";
+ const { pathname } = useLocation();
+ const tab = matchPath({ path: `${routeUrl}/:tab`, end: false }, pathname)?.params.tab;

- if (tabRouteMatch?.params.tab === "stage") {
+ if (tab === "stage") {
      previewState = StageBlock.createPreviewState(document.stage, {
          ...blockContext,
-         parentUrl: `${match.url}/stage`,
+         parentUrl: `${routeUrl}/stage`,
      });
  } else {
      previewState = PageContentBlock.createPreviewState(document.content, {
          ...blockContext,
-         parentUrl: match.url,
+         parentUrl: routeUrl,
      });
  }

  <RouterPrompt
-     message={(location) => (location.pathname.startsWith(match.url) ? true : discardChangesMessage)}
+     message={(location) => (location.pathname.startsWith(routeUrl) ? true : discardChangesMessage)}
  />
```

```sh
grep -rn "useRouteMatch" src --exclude-dir=generated
```

The `url` of `useCurrentRouteMatch()` and the prefix returned by `useSubRoutePrefix()` are encoded like React Router's route URLs, and so are the URLs built from them, such as the `parentUrl` above. In browser history, they're percent-encoded (e.g., `/%C3%BCber/de/pages`), where v5 returned them decoded (`/über/de/pages`). In memory history, they're decoded.

:::note

`location.pathname` keeps the encoding of the URL that was opened, while route URLs follow React Router's encoding. Both agree for canonical browser URLs, which is the common case. If your admin has to handle URLs with special characters in another encoding (e.g., lowercase hex as in `/%c3%bcber`), compare decoded segments. Don't use `useMatch({ path: routeUrl })` for this: it matches against the decoded pathname and fails for every non-ASCII route URL in browser history.

:::

The `cms-admin` components that use the route match internally (`BlockAdminTabs`, `BlockPreviewWithTabs`, `HiddenInSubroute`, `createOptionalBlock`, the composite, list, blocks and columns blocks, `HoverPreviewComponent`) need no changes, but they must be rendered inside a route, such as a `StackPage` or a master menu route.

#### Update the `ContentScopeProvider`

The children of `ContentScopeProvider` are rendered as the element of a route at the URL of the content scope. Routes inside them must be relative, and `SitePreview` is rendered as an element without route props:

```diff title="src/App.tsx"
- import { Route, Switch } from "react-router";
+ import { Route, Routes } from "react-router";

  <ContentScopeProvider>
-     {({ match }) => (
-         <Switch>
-             <Route
-                 path={`${match.path}/preview`}
-                 render={(props) => <SitePreview resolvePath={(path: string, scope) => `/${scope.language}${path}`} {...props} />}
-             />
-             <Route
-                 render={() => (
-                     <MasterLayout headerComponent={MasterHeader} menuComponent={AppMasterMenu}>
-                         <AppMasterMenuRoutes />
-                     </MasterLayout>
-                 )}
-             />
-         </Switch>
-     )}
+     {() => (
+         <Routes>
+             <Route path="preview/*" element={<SitePreview resolvePath={(path: string, scope) => `/${scope.language}${path}`} />} />
+             <Route
+                 path="*"
+                 element={
+                     <MasterLayout headerComponent={MasterHeader} menuComponent={AppMasterMenu}>
+                         <AppMasterMenuRoutes />
+                     </MasterLayout>
+                 }
+             />
+         </Routes>
+     )}
  </ContentScopeProvider>
```

Keep the `ContentScopeProvider` directly inside the router, because the scope URLs are absolute. It redirects to the default scope with `<Navigate replace>`, which happens after the first render.

The `match` passed to the children and returned by `useContentScope()` is a `ContentScopeMatch` (`{ params, url, isExact }`) instead of v5's `match`:

- `match.path` is removed. Use relative routes inside the children, or build absolute URLs from `match.url`.
- `match.url` is the URL of the scope route without a trailing slash (`""` for scopes without dimensions). Every `useCurrentRouteMatch().url` below the scope starts with it.
- In browser history, `match.url` is percent-encoded like React Router's route URLs (`/%C3%BCber/de`), where v5 returned it decoded (`/über/de`).

If you pass a custom `location` to `ContentScopeProvider`, `createPath` returns structured paths now instead of v5 path patterns with regular expressions. Each entry of a path is one URL segment, with the dimension and its allowed values. Return an array of paths to support several URL formats; the first matching path wins:

```diff
+ import { type ContentScopeLocation } from "@dextinity/cms-admin";

- const location = {
-     createPath: () => "/:language(de|en)",
+ const location: ContentScopeLocation = {
+     createPath: () => [{ dimension: "language", values: ["de", "en"] }],
      createUrl: (scope) => `/${scope.language}`,
  };
```

```diff
- createPath: () => ["/:domain(main|secondary)/:language(de|en)", "/:country(at)"],
+ createPath: () => [
+     [
+         { dimension: "domain", values: ["main", "secondary"] },
+         { dimension: "language", values: ["de", "en"] },
+     ],
+     [{ dimension: "country", values: ["at"] }],
+ ],
```

The values are compared literally and case-insensitively with exactly one URL segment. Regular expressions aren't supported anymore. Dimension names must be valid route param names (letters, digits, `_` and `-`). Scopes with `null` values now work with the default location (written as `-` in the URL).

```sh
grep -rnE "createPath|ContentScopeProvider|useContentScope\(\)|match\.path|SitePreview" src --exclude-dir=generated
```

#### Update the master menu

The `route` of a `MasterMenuData` item is a `MasterMenuRoute` (`{ path, element }`) now instead of v5 `RouteProps`. Replace `component` and `render` with `element`. `children`, `exact`, `strict` and `sensitive` are removed. Keep the paths as they are: they start with a slash, are relative to the content scope and match the URLs below them too. Paths must use the v8 syntax, so regular expressions in params and arrays of paths aren't supported.

```diff title="src/common/MasterMenu.tsx"
  {
      type: "route",
      primary: <FormattedMessage id="menu.dashboard" defaultMessage="Dashboard" />,
      icon: <Dashboard />,
-     route: { path: "/dashboard", component: DashboardPage },
+     route: { path: "/dashboard", element: <DashboardPage /> },
  },
  {
      type: "route",
      primary: <FormattedMessage id="menu.dam" defaultMessage="Assets" />,
      icon: <Assets />,
-     route: { path: "/assets", render: () => <DamPage additionalToolbarItems={<ImportFromPicsum />} /> },
+     route: { path: "/assets", element: <DamPage additionalToolbarItems={<ImportFromPicsum />} /> },
  },
  {
      type: "route",
      primary: <FormattedMessage id="menu.newsletter.emailCampaigns" defaultMessage="Email campaigns" />,
-     route: { path: "/newsletter/email-campaigns", component: CampaignsPage },
+     route: { path: "/newsletter/email-campaigns", element: <CampaignsPage /> },
  },
```

Routes that read the route props move into a component that uses hooks:

```diff
- route: {
-     path: "/pages/pagetree/:category",
-     render: ({ match }: RouteComponentProps<{ category: string }>) => {
-         const category = urlParamToCategory(match.params.category);
-         if (category === undefined) {
-             return <Redirect to={`${match.url}/dashboard`} />;
-         }
-         return <PagesPage path={`/pages/pagetree/${match.params.category}`} category={category} /* ... */ />;
-     },
- },
+ route: { path: "/pages/pagetree/:category", element: <PageTreePage /> },

+ function PageTreePage() {
+     const { category: categoryParam = "" } = useParams<{ category: string }>();
+     const { match: contentScopeMatch } = useContentScope();
+     const category = urlParamToCategory(categoryParam);
+     if (category === undefined) {
+         return <Navigate to={`${contentScopeMatch.url}/dashboard`} replace />;
+     }
+     return <PagesPage path={`/pages/pagetree/${categoryParam}`} category={category} /* ... */ />;
+ }
```

The example redirects an invalid category to the dashboard of the content scope (e.g., `/main/en/dashboard`). The v5 redirect to `${match.url}/dashboard` led below the invalid category (e.g., `/main/en/pages/pagetree/foo/dashboard`), which is still invalid and rendered an empty page.

`MasterMenuRoutes` renders a `<Routes>` with a `path/*` route for each menu route, wrapped in a `RouteWithErrorBoundary`, and redirects the URL of the content scope to the first route. Render it inside the scope route, as shown above. The routes are ranked by specificity instead of being matched in the order of the menu. This only makes a difference if a less specific menu route came before a more specific one, which therefore never rendered. `useRoutePropsFromMasterMenuData()` returns `MasterMenuRoute[]`.

The pages of `@dextinity/brevo-admin` are components without props and work as `element` directly (`<CampaignsPage />`, `<BrevoContactsPage />`, …).

```sh
grep -rnE "route: \{|component:|render:|RouteComponentProps" src --exclude-dir=generated
```

#### Update the tests

Navigations are asynchronous now, because the routers are data routers. They are applied in a transition after the click or the `navigate()` call.

- Render tests inside `<RouterMemoryRouter initialEntries={["/products"]}>` instead of passing a `history` object to `<Router>`. Use `initialEntries` and `initialIndex` to set the starting location.
- Read the location with a small component that calls `useLocation()`, instead of reading `history.location`.
- Wait for navigations and redirects with `findBy*`, `waitFor` or `await act(async () => …)`.
- MUI dialogs stay in the DOM during their exit transition, so assert their disappearance in `waitFor`.

```diff
- const history = createMemoryHistory({ initialEntries: ["/products"] });
- render(
-     <Router history={history}>
-         <ProductsPage />
-     </Router>,
- );
- fireEvent.click(getByText("Edit"));
- expect(history.location.pathname).toBe("/products/1/edit");
+ let pathname: string | undefined;
+ function LocationSpy() {
+     pathname = useLocation().pathname;
+     return null;
+ }
+ render(
+     <RouterMemoryRouter initialEntries={["/products"]}>
+         <ProductsPage />
+         <LocationSpy />
+     </RouterMemoryRouter>,
+ );
+ fireEvent.click(getByText("Edit"));
+ await waitFor(() => expect(pathname).toBe("/products/1/edit"));
```

In Storybook, replace a React Router `MemoryRouter` inside a story with `RouterMemoryRouter`.

#### Review the behaviour changes

The following changes don't require code changes, but check whether your admin relies on the old behaviour:

- Closing a dirty `EditDialog` on the initial page of a `StackSwitch` (Cancel or deselect) asks "Do you want to save your changes?", like `EditDialog`s everywhere else. v5 closed it without asking.
- Inside an `EditDialog` on the initial page of a `StackSwitch`, the route context is the selection (e.g., `/products/index/7`). `useParams().id` is the selected id, and `RouterTabs` and the default `subRoutePath` of `FinalForm` and `SaveBoundary` build their URLs below the selection.
- Navigating to an empty prefix (the initial page, deselecting a `SelectionRoute` or the default tab of `RouterTabs` at the root of the router) goes to `/`. v5 stayed on the current URL.
- `MainNavigation` closes its temporary drawer on every location change, as before.
- Data Grids that persist their column state with `usePersistentColumnState` keep their keys in pages rendered by Dextinity components. In the following cases, the key changes and the stored column state is lost once:
    - Grids inside an `EditDialog` or `SelectionRoute` on the initial page of a `StackSwitch` (e.g., `/products/index/:id` instead of `/products/:id`).
    - Grids rendered directly in a master menu route (e.g., the `WarningsGrid`), whose key now starts with `/:domain/:language` instead of the regular expression of the content scope.
    - Grids inside the tabs of `BlockAdminTabs` (e.g., `DependentsList` and `DependenciesList`), which share their column state between pages now instead of storing it per page.
    - Grids in your own routes whose v5 path contained regular expressions, path arrays or concrete URLs from `match.url`.

#### Verify that no React Router v5 APIs remain

```sh
cd admin
grep -rnE "react-router-dom|from \"history\"|\b(useHistory|useRouteMatch|withRouter|RouteComponentProps|Switch|Redirect)\b|<Route\b.*\b(component|render|exact)\b" src --include="*.tsx" --include="*.ts" --exclude-dir=generated
```

The command must not find anything except components of other libraries with the same name, such as MUI's `Switch`. Also check the master menu for `component:` and `render:`:

```sh
cd admin
grep -rnE "\b(component|render):" src/common/MasterMenu.tsx
```

Then type-check the admin and fix the remaining errors:

```sh
cd admin
npx tsc --noEmit
```

Start the admin and open each page of the master menu, a stack page, a tab and an edit dialog to check that they render.

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
cd admin
npm run lint
```

Repeat this step, fixing all lint errors, until the lint passes.

## Mails

Skip this section if your project doesn't use `@dextinity/mail-react`.

### Await `renderMailHtml`

`@dextinity/mail-react` now uses MJML 5, which renders asynchronously. `renderMailHtml` from `@dextinity/mail-react/server` and `@dextinity/mail-react/client` returns a promise now. Find its calls in every package that uses it (usually the API and the site):

```sh
grep -rn "renderMailHtml(" src
```

Await each call, and make the enclosing function `async` where it isn't yet:

```diff
- const { html, mjmlWarnings } = renderMailHtml(<MyMail />);
+ const { html, mjmlWarnings } = await renderMailHtml(<MyMail />);
```

A missing `await` compiles in places that don't use the result's properties, so check every call, not only the ones TypeScript reports.

### Update `mjml`

If a package lists `mjml` in its own `package.json` (e.g., a Next.js site that renders mails on the server), update it to v5:

```sh
npm install mjml@^5.4.1
```

Then verify that the package still builds and lint passes.

### Test the mails in every supported mail client

MJML 5 changes the HTML it generates, so a mail can look different even though its code didn't change. See the [MJML 5 release notes](https://github.com/mjmlio/mjml/releases/tag/v5.0.0) for the full list. The changes most likely to affect your mails:

- The HTML and CSS are minified more aggressively. Tooling that parses or compares the generated HTML (snapshots, regular expressions) may need updating.
- `mj-body` generates the `<body>` tag now. Its `class` moves from the inner `<div>` to `<body>`, and its background color moves from `<body>` to the inner `<div>`, so CSS targeting either of them may stop applying.
- The `inner-padding` of `mj-hero` applies in every client now, not only in Outlook.
- Template syntax inside CSS or `style` attributes (e.g., `{{ color }}`) can make the CSS minification fail.

Client-specific workarounds are especially sensitive to these changes, because they often depend on the exact HTML structure. Send every mail of your project to each mail client you support (e.g., Outlook, Gmail, Apple Mail) and compare it with the version rendered by MJML 4.

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
