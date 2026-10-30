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

### Convert the API to ESM

`@dextinity/cms-api`, `@dextinity/brevo-api` and `@dextinity/api-generator` are ESM-only from v11 on. A CommonJS API could still load them through `require(esm)`, but every dependency that ships separate CommonJS and ESM builds would then be loaded twice — once for your code and once for Dextinity. For `graphql-scalars` this breaks the schema with `Schema must contain uniquely named types but contains multiple types named "LocalDate"`. Convert the API to ESM:

```diff title="api/package.json"
{
-   "type": "commonjs",
+   "type": "module",
}
```

Add `.js` to every relative and `@src/` import. TypeScript reports the ones that are missing (TS2835 for relative imports, TS2307 for `@src/` imports), and maps `./foo.js` to `./foo.ts`. A directory import becomes `./foo/index.js`:

```diff
- import { AppModule } from "@src/app.module";
- import { createConfig } from "./config/config";
+ import { AppModule } from "@src/app.module.js";
+ import { createConfig } from "./config/config.js";
```

Enable `verbatimModuleSyntax`. The development scripts run the source through `@swc-node/register`, which compiles every file on its own and can't tell whether an import is a type. ES modules fail to link when a named import doesn't exist at runtime, so type-only imports have to say so:

```diff title="api/tsconfig.json"
{
    "compilerOptions": {
+       "verbatimModuleSyntax": true,
    }
}
```

Run `npx tsc --noEmit` and mark every import and re-export TypeScript reports (TS1484, TS1205) as `type`. Don't mark class imports as `type`: the emitted decorator metadata needs them for dependency injection.

Replace the CommonJS-only constructs:

```diff
- path.resolve(__dirname, "migrations")
+ path.resolve(import.meta.dirname, "migrations")
```

```diff title="api/src/db/ormconfig.cli.ts"
- export = config;
+ export default config;
```

JSON imports need an import attribute. `@swc-node/register` doesn't resolve path aliases for imports with attributes, so use a relative path:

```diff title="api/src/config/config.ts"
- import dextinityConfig from "@src/dextinity-config.json";
+ // eslint-disable-next-line @dextinity/no-other-module-relative-import -- @swc-node/register doesn't resolve path aliases for imports with attributes
+ import dextinityConfig from "../dextinity-config.json" with { type: "json" };
```

Run the TypeScript scripts with `@swc-node/register` instead of `ts-node`. Nest CLI rewrites the `@src/` aliases in the build output, so `tsconfig-paths` isn't needed anymore:

```diff title="api/package.json"
{
    "scripts": {
-       "console": "... ts-node --transpile-only -r tsconfig-paths/register src/console.ts",
+       "console": "... node --import @swc-node/register/esm-register src/console.ts",
    },
    "devDependencies": {
-       "ts-node": "^10.9.2",
-       "tsconfig-paths": "^4.2.0",
    }
}
```

If `src/repl.ts` imports `tsconfig-paths/register`, remove that import.

Static imports are evaluated before the module body runs, so `require("./tracing")` at the top of `main.ts` no longer runs before the application is loaded. Move the bootstrap code to `src/bootstrap.ts` and load it dynamically after tracing:

```ts title="api/src/main.ts"
if (process.env.TRACING == "production") {
    await import("./tracing.production.js");
} else if (process.env.TRACING == "dev") {
    await import("./tracing.dev.js");
}

// Imported dynamically so that the application's modules are loaded after tracing has been set up and can be instrumented.
await import("./bootstrap.js");
```

OpenTelemetry instrumentations only patch ES modules through a loader hook. If you use them, add `import-in-the-middle` to the dependencies and register its hook in the tracing file. Limit the hook to the modules the instrumentations patch: wrapping every module breaks packages with circular imports, such as `@getbrevo/brevo`, with `ReferenceError: Cannot access 'BrevoError' before initialization`.

```ts title="api/src/tracing.dev.ts"
import { register } from "node:module";
import { createAddHookMessageChannel } from "import-in-the-middle";

const { registerOptions, waitForAllMessagesAcknowledged } = createAddHookMessageChannel();
register("import-in-the-middle/hook.mjs", import.meta.url, registerOptions);

// Create the NodeSDK with the instrumentations
sdk.start();

await waitForAllMessagesAcknowledged();
```

Circular imports that worked in CommonJS can now fail on startup with `ReferenceError: Cannot access 'X' before initialization`. TypeScript references the class in the emitted decorator metadata, which ESM evaluates before the class is defined. Wrap the type so that the metadata falls back to `Object`:

- For entity relations, use MikroORM's `Rel<T>`:

    ```diff
    + import { type Rel } from "@mikro-orm/postgresql";

      @ManyToOne(() => News)
    - news!: News;
    + news!: Rel<News>;
    ```

- For injected services, inject them with `forwardRef()` and wrap the type in a type alias:

    ```ts
    type WrapperType<T> = T;

    constructor(@Inject(forwardRef(() => FilesService)) private readonly filesService: WrapperType<FilesService>) {}
    ```

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

The API Generator reads MikroORM metadata, which changed shape in v7, and now generates ESM code. Regenerate and check that the only changes are `.js` extensions on relative imports and `type` on type-only imports:

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
