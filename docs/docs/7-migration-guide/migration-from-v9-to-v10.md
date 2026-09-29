---
title: Migrating from v9 to v10
sidebar_position: -10
---

# Migrating from v9 to v10

:::info AI-Assisted Migration

This migration guide is designed to be executed by an AI coding agent (e.g., Claude Code). Each section contains structured, step-by-step instructions that an agent can follow to perform the migration automatically.

**Sample prompt to get started:**

```
Migrate this project from Comet v9 to Dextinity v10. Follow the migration guide at https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v9-to-v10 step by step. Work through each section sequentially, making the required changes and running any verification commands. Commit after each major section.
```

:::

## What changes in v10

v10 renames Comet DXP to **Dextinity**. The npm scope changes from `@comet` to `@dextinity`, and the `Comet` prefix is dropped from exported symbols, theme component names, CSS variables, CSS class names, cookies, database tables, CLI binaries, generator config files and Format.js message IDs.

**There are no functional changes.** Every breaking change in this major is a rename. The only behavioral addition is support for `dextinity.com/*` Kubernetes labels and annotations, which is backwards compatible (see [Kubernetes labels and annotations](#kubernetes-labels-and-annotations)).

That makes this migration mechanical but wide: it touches nearly every file that imports from the library. Work through the sections **in order**, commit after each one, and let the verification steps prove the result.

### Renamed packages

| v9                          | v10                             |
| --------------------------- | ------------------------------- |
| `@comet/admin`              | `@dextinity/admin`              |
| `@comet/admin-babel-preset` | `@dextinity/admin-babel-preset` |
| `@comet/admin-color-picker` | `@dextinity/admin-color-picker` |
| `@comet/admin-date-time`    | `@dextinity/admin-date-time`    |
| `@comet/admin-generator`    | `@dextinity/admin-generator`    |
| `@comet/admin-icons`        | `@dextinity/admin-icons`        |
| `@comet/admin-rte`          | `@dextinity/admin-rte`          |
| `@comet/agent-features`     | `@dextinity/agent-features`     |
| `@comet/api-generator`      | `@dextinity/api-generator`      |
| `@comet/brevo-admin`        | `@dextinity/brevo-admin`        |
| `@comet/brevo-api`          | `@dextinity/brevo-api`          |
| `@comet/cli`                | `@dextinity/cli`                |
| `@comet/cms-admin`          | `@dextinity/cms-admin`          |
| `@comet/cms-api`            | `@dextinity/cms-api`            |
| `@comet/eslint-config`      | `@dextinity/eslint-config`      |
| `@comet/eslint-plugin`      | `@dextinity/eslint-plugin`      |
| `@comet/mail-react`         | `@dextinity/mail-react`         |
| `@comet/site-nextjs`        | `@dextinity/site-nextjs`        |
| `@comet/site-react`         | `@dextinity/site-react`         |

:::note Not part of this migration

`@comet/dev-process-manager` and `@comet/dev-oidc-provider` left the `@comet` scope in releases of their own (`dev-process-manager` v4 and `dev-oidc-provider` v2). They are development tools that aren't part of v10, so switching to them is optional and can happen in a separate change. **They have no `@dextinity/*` counterpart** — keep that in mind when replacing the scope in [Replace the `@comet/*` dependencies and imports](#replace-the-comet-dependencies-and-imports).

:::

### Renamed binaries, files and config

| v9                        | v10                           |
| ------------------------- | ----------------------------- |
| `comet` (CLI)             | `dextinity`                   |
| `comet-api-generator`     | `dextinity-api-generator`     |
| `comet-admin-generator`   | `dextinity-admin-generator`   |
| `comet-config.json`       | `dextinity-config.json`       |
| `*.cometGen.tsx`          | `*.dextinityGen.tsx`          |
| `vivid-planet/comet-lang` | `vivid-planet/dextinity-lang` |

### How to run the search & replace

:::caution Never run a blanket, case-insensitive replace of `comet` over the repository

The following look like leftovers but must stay untouched:

- **Existing database migrations** (`api/src/db/migrations/*.ts`). They are a historical record and reference the old table names on purpose. Rewriting them breaks migration replay on fresh databases.
- **`comet-dxp.com/*` Kubernetes labels and annotations** in Helm charts. They are still supported; migrating them is optional and deliberate (see [Kubernetes labels and annotations](#kubernetes-labels-and-annotations)).
- **Project-owned names** that merely contain the word (a `comet.jpg` DAM fixture, a `CometTeaser` block a project happens to own, a customer's own `comet` CSS class).
- **Old changelog entries** and any archived documentation.

:::

Use targeted, case-sensitive replacements per pattern, and prefer `git grep -l` piped into `perl -pi -e`. `git grep` only lists tracked files, so `node_modules` and ignored build output are skipped automatically, and `perl` behaves the same on Linux and macOS (unlike `sed -i`):

```sh
git grep -l "<pattern>" -- <path> | xargs perl -pi -e 's{<pattern>}{<replacement>}g'
```

After each replacement, run `git grep "<pattern>"` again — an empty result is the proof that the step is done.

If your project **commits generated files** (`src/**/generated/**`, `graphql.generated.ts`, `blocks.generated.ts`, `schema.gql`, `block-meta.json`), don't hand-edit them: rerun the generators as described in the API and Admin sections.

## Root

### Update the dependencies

Update the `@comet/*` dependencies in the root `package.json` to their `@dextinity/*` counterparts at version `10.0.0`:

```diff title="package.json"
{
    "devDependencies": {
-       "@comet/cli": "^9.0.0",
+       "@dextinity/cli": "10.0.0",
-       "@comet/agent-features": "^9.0.0",
+       "@dextinity/agent-features": "10.0.0",
    }
}
```

:::note

`10.0.0` is illustrative. Prefer the newest stable release within the new major (e.g. `10.1.2`) and pin every `@dextinity/*` package to that same exact version:

```sh
npm view @dextinity/cms-api versions --json
```

:::

Then, install the updated dependencies:

```sh
npm install
```

### Rename the `comet` CLI binary to `dextinity`

`@dextinity/cli` ships its binary as `dextinity`. All its commands (`generate-block-types`, `inject-site-configs`, `download-oauth2-proxy`, `download-mitmproxy`, `install-agent-features`) keep their names and options.

```diff title="package.json"
{
    "scripts": {
-       "generate-block-types": "comet generate-block-types",
+       "generate-block-types": "dextinity generate-block-types",
-       "create-site-configs-env": "comet inject-site-configs -f site-configs.ts -i .env.site-configs.tpl -o .env.site-configs",
+       "create-site-configs-env": "dextinity inject-site-configs -f site-configs.ts -i .env.site-configs.tpl -o .env.site-configs",
    }
}
```

Find the remaining call sites — they are frequently outside `package.json`:

```sh
git grep -n -E "(npx |exec )?@?comet(/cli)? (generate-block-types|inject-site-configs|download-oauth2-proxy|download-mitmproxy|install-agent-features)"
```

Check `install.sh`, `Dockerfile`, `docker-compose.yml`, `.github/workflows/*.yml`, `dev-pm.config.ts` and any deployment scripts.

### Rename `comet-config.json` to `dextinity-config.json`

By convention the shared config file is now named `dextinity-config.json`. Rename it and update everything that reads or copies it:

```sh
git mv comet-config.json dextinity-config.json
```

```diff title="api/src/config/config.ts"
- import cometConfig from "@src/comet-config.json";
+ import dextinityConfig from "@src/dextinity-config.json";

  export function createConfig(processEnv: NodeJS.ProcessEnv) {
      return {
-         ...cometConfig,
+         ...dextinityConfig,
          debug: envVars.NODE_ENV !== "production",
      };
  }
```

```diff title="admin/src/config.ts"
- import cometConfig from "./comet-config.json";
+ import dextinityConfig from "./dextinity-config.json";
```

If the file is copied into the services (e.g. by a `copy-project-files.js` script), update the copy list and the `.gitignore` entries of every target:

```diff title="admin/.gitignore"
- src/comet-config.json
+ src/dextinity-config.json
```

```diff title="site/.gitignore"
- src/comet-config.json
+ src/dextinity-config.json
```

The file's contents (`imgproxy`, `dam`, `images`, …) are unchanged.

### Rename the agent features

The skills shipped by `@dextinity/agent-features` were renamed. Reinstall them and delete the ones installed under the old names:

```sh
npx @dextinity/cli install-agent-features
```

| v9                                     | v10                                        |
| -------------------------------------- | ------------------------------------------ |
| `comet-admin-ui`                       | `dextinity-admin-ui`                       |
| `comet-block`                          | `dextinity-block`                          |
| `comet-core-admin-component-authoring` | `dextinity-core-admin-component-authoring` |
| `comet-mail-react`                     | `dextinity-mail-react`                     |
| `comet-major-migration`                | `dextinity-major-migration`                |
| `comet-minor-update`                   | `dextinity-minor-update`                   |

Remove the stale skill directories so agents don't load both versions:

```sh
rm -rf .claude/skills/comet-admin-ui .claude/skills/comet-block .claude/skills/comet-core-admin-component-authoring .claude/skills/comet-mail-react .claude/skills/comet-major-migration .claude/skills/comet-minor-update
```

The `dev-pm` skill, the rules under `rules/coding-guidelines/` and the `agent-features.json` format are unchanged.

Also update the package name in the install script and the root `package.json`:

```diff title="package.json"
{
    "scripts": {
-       "install-agent-features": "npx @comet/cli install-agent-features"
+       "install-agent-features": "npx @dextinity/cli install-agent-features"
    }
}
```

### Update tooling and documentation references

These don't break the build but leave the project pointing at names that no longer exist:

- **Renovate**: package rules matching `@comet/*` no longer group the library updates.

    ```diff title="renovate.json"
    - "matchPackagePatterns": ["^@comet/"],
    + "matchPackagePatterns": ["^@dextinity/"],
    ```

- **Documentation links**: `https://docs.comet-dxp.com` → `https://cms-docs.dextinity.com`, `https://comet-admin.netlify.app` → `https://cms-storybook.dextinity.com`, `github.com/vivid-planet/comet` → `github.com/vivid-planet/dextinity`.
- **`AGENTS.md` / `CLAUDE.md`**: package tables, skill names and doc links.
- **CI workflows**: cache keys and filters referencing `@comet/*`.

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
npm run lint:root
```

Repeat this step, fixing all lint errors, until the lint passes.

## All packages

The following changes apply to API, Admin and Site. Run the steps in each package that consumes `@dextinity/*` packages.

### Replace the `@comet/*` dependencies and imports

Every dependency and every import specifier changes scope. Because `@comet/` is a distinct, case-sensitive string, a single replacement per package is safe:

```sh
git grep -l "@comet/" -- <package> | xargs perl -pi -e 's{\@comet/}{\@dextinity/}g'
```

This covers `package.json` dependencies, `import`/`export` statements, `eslint.config.mjs`, `babel.config.js`, `tsconfig.json` path mappings, `vite.config.ts` optimizations, Jest/Vitest module mappings and Docker/CI filters.

```diff
- import { MainContent } from "@comet/admin";
+ import { MainContent } from "@dextinity/admin";
```

Subpath imports keep their shape:

```diff
- import { sitePreviewRoute } from "@comet/site-nextjs/server";
+ import { sitePreviewRoute } from "@dextinity/site-nextjs/server";
```

:::caution

`@comet/dev-process-manager` and `@comet/dev-oidc-provider` have **no `@dextinity/*` counterpart** — a blanket scope replacement turns them into packages that don't exist and breaks `npm install`. If your project still depends on them, restore them afterwards or exclude them from the replacement:

```sh
git grep -l "@comet/" -- <package> | xargs perl -pi -e 's{\@comet/(?!dev-)}{\@dextinity/}g'
```

:::

Afterwards, reinstall so the lockfile is rewritten:

```sh
npm install
```

Then verify that nothing is left — including in the lockfile, which is tracked and therefore covered by `git grep`:

```sh
git grep -n "@comet/"
```

### Update the ESLint plugin namespace

`@dextinity/eslint-plugin` registers under the `@dextinity` namespace, so every rule name changes. This affects rule overrides in ESLint configs **and** `eslint-disable` comments in source files.

| v9                                       | v10                                          |
| ---------------------------------------- | -------------------------------------------- |
| `@comet/no-other-module-relative-import` | `@dextinity/no-other-module-relative-import` |
| `@comet/no-private-sibling-import`       | `@dextinity/no-private-sibling-import`       |

```diff title="eslint.config.mjs"
- import eslintConfigReact from "@comet/eslint-config/future/react.js";
+ import eslintConfigReact from "@dextinity/eslint-config/future/react.js";

  export default [
      ...eslintConfigReact,
      {
          rules: {
-             "@comet/no-other-module-relative-import": "off",
+             "@dextinity/no-other-module-relative-import": "off",
          },
      },
  ];
```

```diff
- // eslint-disable-next-line @comet/no-private-sibling-import
+ // eslint-disable-next-line @dextinity/no-private-sibling-import
```

The `@comet/` → `@dextinity/` replacement from the previous step already covers both cases. Search for stragglers:

```sh
git grep -n -E "@comet/(no-other-module-relative-import|no-private-sibling-import)"
```

The exported configs (`core.js`, `react.js`, `nextjs.js`, `nestjs.js` and their `future/` variants) keep their paths, and no rules were added or removed in this major.

### Rename Babel preset references

```diff title="babel.config.js"
- "presets": ["@comet/admin-babel-preset"]
+ "presets": ["@dextinity/admin-babel-preset"]
```

## API

### Update the Dextinity dependencies

Update all `@dextinity/*` dependencies in `api/package.json` to version `10.0.0`:

```diff title="api/package.json"
{
    "dependencies": {
-       "@comet/cms-api": "^9.0.0",
+       "@dextinity/cms-api": "10.0.0",
-       "@comet/mail-react": "^9.0.0",
+       "@dextinity/mail-react": "10.0.0",
    },
    "devDependencies": {
-       "@comet/api-generator": "^9.0.0",
+       "@dextinity/api-generator": "10.0.0",
-       "@comet/eslint-config": "^9.0.0",
+       "@dextinity/eslint-config": "10.0.0",
    }
}
```

Update any other packages your project uses (e.g. `@dextinity/brevo-api`) to the same version.

Then, install the updated dependencies:

```sh
npm install
```

### Rename the exceptions

`CometException` and its subclasses were renamed. The **error codes returned by the API change accordingly**, which is why a matching `@dextinity/cms-admin` version is required in the Admin.

| v9                              | v10                                 |
| ------------------------------- | ----------------------------------- |
| `CometException`                | `DextinityException`                |
| `CometValidationException`      | `DextinityValidationException`      |
| `CometEntityNotFoundException`  | `DextinityEntityNotFoundException`  |
| `CometImageResolutionException` | `DextinityImageResolutionException` |

```diff
- import { CometValidationException } from "@comet/cms-api";
+ import { DextinityValidationException } from "@dextinity/cms-api";

- throw new CometValidationException("Invalid input");
+ throw new DextinityValidationException("Invalid input");
```

```sh
git grep -l -E "Comet(Validation|EntityNotFound|ImageResolution)?Exception" -- api \
  | xargs perl -pi -e 's{\bComet(Validation|EntityNotFound|ImageResolution)?Exception\b}{Dextinity$1Exception}g'
```

If any custom exception in your project extends `CometException`, update the base class too. Watch out for API clients that match on the error code string (e.g. a site or an external consumer checking for `CometValidationException`) — those need the new code.

### Rename the auth guard and the guard decorator

| v9                      | v10                         |
| ----------------------- | --------------------------- |
| `CometAuthGuard`        | `DextinityAuthGuard`        |
| `@DisableCometGuards()` | `@DisableDextinityGuards()` |

```diff
- import { CometAuthGuard, DisableCometGuards } from "@comet/cms-api";
+ import { DextinityAuthGuard, DisableDextinityGuards } from "@dextinity/cms-api";

- @DisableCometGuards()
+ @DisableDextinityGuards()
  @Resolver()
  export class PublicResolver {}
```

```sh
git grep -n -E "CometAuthGuard|DisableCometGuards" -- api
```

### Rename the API Generator binary

```diff title="api/package.json"
{
    "scripts": {
-       "generate-crud": "comet-api-generator",
+       "generate-crud": "dextinity-api-generator",
-       "api-generator": "rimraf --glob 'src/**/generated' && comet-api-generator generate",
+       "api-generator": "rimraf --glob 'src/**/generated' && dextinity-api-generator generate",
    }
}
```

The `@CrudGenerator` / `@CrudSingleGenerator` decorators and their options are unchanged.

### Regenerate the generated API files

The header comment of generated files changed to `// This file has been generated by Dextinity API Generator.`, and the generated code imports from `@dextinity/cms-api`. Rerun the generators:

```sh
cd api
npm run api-generator
npm run generate-block-types
```

Regenerate `schema.gql` as well (usually by starting the API or via the project's `console`/build script) and commit the result if generated files are tracked.

### Run the database migrations

Three library tables were renamed:

| v9                       | v10                          |
| ------------------------ | ---------------------------- |
| `CometFileUpload`        | `DextinityFileUpload`        |
| `CometUserPermission`    | `DextinityUserPermission`    |
| `CometUserContentScopes` | `DextinityUserContentScopes` |

`@dextinity/cms-api` ships a migration (`Migration20260803090000`) that renames the tables and the `CometFileUpload_contentHash_index` index, so running the migrations is sufficient:

```sh
cd api
npm run db:migrate
```

:::caution

Do **not** rewrite existing project migrations that reference the old table names. Foreign keys and their constraint names follow the rename automatically in PostgreSQL, so old migrations stay replayable on a fresh database.

:::

After migrating, check that MikroORM doesn't want to change the schema — a non-empty diff means something in the project still maps to an old table name:

```sh
cd api
npm run mikro-orm -- schema:update --dump
```

### Update raw SQL and hard-coded table names

Anything that references the renamed tables outside of MikroORM entities has to be updated: raw `EntityManager.execute()` queries, SQL views (including block index views), `@Entity({ tableName: ... })` overrides in project entities, database triggers, seed/fixture SQL, analytics queries and backup or monitoring scripts.

```sh
git grep -n -E "\"?Comet(FileUpload|UserPermission|UserContentScopes)\"?" -- api ':!api/src/db/migrations'
```

If the project defines SQL views over these tables, drop and recreate them in a project migration.

### Rename the cookies read by the API

| v9                          | v10                             |
| --------------------------- | ------------------------------- |
| `__comet_site_preview`      | `__dextinity_site_preview`      |
| `comet-impersonate-user-id` | `dextinity-impersonate-user-id` |

Both are handled inside the library, so no code change is needed unless your project reads or sets them itself:

```sh
git grep -n -E "__comet_site_preview|comet-impersonate-user-id"
```

There is **no fallback to the old cookie names**, which has two consequences:

- API, Admin and Site must be deployed together (see [Deployment](#deployment)).
- Active site preview sessions and impersonations end at the deployment; users have to start them again.

### Kubernetes labels and annotations

The Builds, Cron Jobs and Kubernetes modules now read `dextinity.com/*` labels and annotations:

| v9                              | v10                             |
| ------------------------------- | ------------------------------- |
| `comet-dxp.com/instance`        | `dextinity.com/instance`        |
| `comet-dxp.com/parent-cron-job` | `dextinity.com/parent-cron-job` |
| `comet-dxp.com/label`           | `dextinity.com/label`           |
| `comet-dxp.com/builder`         | `dextinity.com/builder`         |
| `comet-dxp.com/trigger`         | `dextinity.com/trigger`         |
| `comet-dxp.com/content-scope`   | `dextinity.com/content-scope`   |

This change is **backwards compatible and optional**: the `comet-dxp.com` prefix is still supported, so existing Helm charts keep working without changes. If no resource matches the `dextinity.com` labels, the `comet-dxp.com` ones are used instead.

Resources are expected to use **one prefix or the other**, not a mix. If you migrate the Helm chart, rename all labels and annotations of all resources in the same deployment:

```diff title="helm/templates/cron-job.yaml"
  metadata:
      annotations:
-         comet-dxp.com/label: "Demo Cron Job"
-         comet-dxp.com/content-scope: '{ "domain": "main", "language": "en" }'
+         dextinity.com/label: "Demo Cron Job"
+         dextinity.com/content-scope: '{ "domain": "main", "language": "en" }'
```

### Verify the API still starts

Type checks don't catch a broken NestJS module graph. Verify the AppModule still resolves and the generated artifacts are up to date:

```sh
cd api
npm run console -- --help
```

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
cd api
npm run lint
```

Repeat this step, fixing all lint errors, until the lint passes.

## Admin

### Update the Dextinity and peer dependencies

Update all `@dextinity/*` dependencies in `admin/package.json` to version `10.0.0`:

```diff title="admin/package.json"
{
    "dependencies": {
-       "@comet/admin": "^9.0.0",
+       "@dextinity/admin": "10.0.0",
-       "@comet/admin-color-picker": "^9.0.0",
+       "@dextinity/admin-color-picker": "10.0.0",
-       "@comet/admin-icons": "^9.0.0",
+       "@dextinity/admin-icons": "10.0.0",
-       "@comet/admin-rte": "^9.0.0",
+       "@dextinity/admin-rte": "10.0.0",
-       "@comet/cms-admin": "^9.0.0",
+       "@dextinity/cms-admin": "10.0.0",
    },
    "devDependencies": {
-       "@comet/admin-babel-preset": "^9.0.0",
+       "@dextinity/admin-babel-preset": "10.0.0",
-       "@comet/admin-generator": "^9.0.0",
+       "@dextinity/admin-generator": "10.0.0",
-       "@comet/eslint-config": "^9.0.0",
+       "@dextinity/eslint-config": "10.0.0",
    }
}
```

No peer dependency versions (React, MUI, Apollo, Final Form, …) change in this major.

Then, install the updated dependencies:

```sh
npm install
```

### Rename `createCometTheme`

```diff title="admin/src/theme.ts"
- import { createCometTheme } from "@comet/admin";
+ import { createDextinityTheme } from "@dextinity/admin";

- export const theme = createCometTheme({
+ export const theme = createDextinityTheme({
      palette: { primary: { main: "#0000ff" } },
  });
```

```sh
git grep -l "createCometTheme" -- admin | xargs perl -pi -e 's{\bcreateCometTheme\b}{createDextinityTheme}g'
```

### Rename the theme component prefix

The theme component prefix changed from `CometAdmin` to `DextinityAdmin`. This affects three things:

1. **`components` overrides** passed to `createDextinityTheme`:

    ```diff title="admin/src/theme.ts"
      export const theme = createDextinityTheme({
          components: {
    -         CometAdminMainNavigation: {
    +         DextinityAdminMainNavigation: {
                  styleOverrides: { root: { width: 300 } },
              },
    -         CometAdminSaveButton: {
    +         DextinityAdminSaveButton: {
                  defaultProps: { variant: "contained" },
              },
          },
      });
    ```

2. **The `name` passed to `useThemeProps`** in custom components that hook into the theme:

    ```diff
    - const { slotProps, ...restProps } = useThemeProps({ props: inProps, name: "CometAdminMyComponent" });
    + const { slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminMyComponent" });
    ```

3. **The generated CSS class names**, wherever they are used in selectors:

    ```diff
    - .CometAdminClearInputAdornment-root { … }
    + .DextinityAdminClearInputAdornment-root { … }
    ```

    ```diff
    - `& .CometAdminMainContent-root`: { padding: 0 },
    + `& .DextinityAdminMainContent-root`: { padding: 0 },
    ```

All three follow the same pattern, so one replacement covers them. This applies to `@dextinity/admin`, `@dextinity/admin-color-picker`, `@dextinity/admin-date-time`, `@dextinity/admin-rte` and `@dextinity/cms-admin` alike:

```sh
git grep -l "CometAdmin" -- admin | xargs perl -pi -e 's{\bCometAdmin}{DextinityAdmin}g'
```

Verify nothing is left, including in CSS, SCSS and Emotion/styled template strings:

```sh
git grep -n "CometAdmin"
```

### Rename the CSS variables

| v9                                                | v10                                                   |
| ------------------------------------------------- | ----------------------------------------------------- |
| `--comet-admin-master-layout-content-top-spacing` | `--dextinity-admin-master-layout-content-top-spacing` |
| `--comet-admin-master-layout-menu-width`          | `--dextinity-admin-master-layout-menu-width`          |
| `--comet-admin-loading-offset-top`                | `--dextinity-admin-loading-offset-top`                |
| `--comet-admin-rte-outer-border-color`            | `--dextinity-admin-rte-outer-border-color`            |

```sh
git grep -l -e "--comet-admin-" | xargs perl -pi -e 's{--comet-admin-}{--dextinity-admin-}g'
```

Check global stylesheets and `Global`/`GlobalStyles` blocks as well — these variables are typically set outside of components.

### Replace the removed logo and icon components

| Removed                                             | Replacement                                     |
| --------------------------------------------------- | ----------------------------------------------- |
| `CometLogo` (`@comet/admin`)                        | `DextinityLogo` (`@dextinity/admin-icons`)      |
| `CometDigitalExperienceLogo` (`@comet/admin-icons`) | `DextinityLogo` (`light`, `dark`, `monochrome`) |
| `CometColor` (`@comet/admin-icons`)                 | `DextinityIcon` (`light`, `dark`, `masked`)     |
| `Comet`, `CometOutline` (`@comet/admin-icons`)      | removed without replacement                     |

Both new components derive their size from `fontSize`, so call sites no longer pass `width`/`height` pairs:

```diff
- import { CometDigitalExperienceLogo } from "@comet/admin-icons";
+ import { DextinityLogo } from "@dextinity/admin-icons";

- <CometDigitalExperienceLogo width={132} height={30} />
+ <DextinityLogo sx={{ fontSize: 30 }} />
```

```diff
- import { CometColor } from "@comet/admin-icons";
+ import { DextinityIcon } from "@dextinity/admin-icons";

- <CometColor />
+ <DextinityIcon sx={{ fontSize: 32 }} />
```

`DextinityLogo`'s `monochrome` variant renders mark and wordmark in a single color inherited from `currentColor`, so use `color`/`htmlColor` instead of picking a black/grey/white asset:

```diff
- <CometDigitalExperienceLogo />
+ <DextinityLogo variant="monochrome" htmlColor="white" sx={{ fontSize: 30 }} />
```

The `IconName` type renamed its `CometColor` member to `DextinityIcon`:

```diff
- const icon: IconName = "CometColor";
+ const icon: IconName = "DextinityIcon";
```

If your project passed its own logo to `Header`, `AboutModal` or `SitePreview`, nothing changes — only the defaults were replaced with the Dextinity logo. Find the affected call sites:

```sh
git grep -n -E "\bComet(Logo|Color|Outline|DigitalExperienceLogo)\b|\bComet\b" -- admin
```

### Rename `CometConfigProvider`

| v9                    | v10                       |
| --------------------- | ------------------------- |
| `CometConfigProvider` | `DextinityConfigProvider` |
| `useCometConfig`      | `useDextinityConfig`      |
| `CometConfig` (type)  | `DextinityConfig`         |

```diff title="admin/src/App.tsx"
- import { CometConfigProvider } from "@comet/cms-admin";
+ import { DextinityConfigProvider } from "@dextinity/cms-admin";

- <CometConfigProvider {...config} graphQLApiUrl={`${config.apiUrl}/graphql`}>
+ <DextinityConfigProvider {...config} graphQLApiUrl={`${config.apiUrl}/graphql`}>
      {/* … */}
- </CometConfigProvider>
+ </DextinityConfigProvider>
```

```diff
- const { apiUrl } = useCometConfig();
+ const { apiUrl } = useDextinityConfig();
```

```sh
git grep -l -E "CometConfigProvider|useCometConfig|\bCometConfig\b" -- admin \
  | xargs perl -pi -e 's{\bCometConfigProvider\b}{DextinityConfigProvider}g; s{\buseCometConfig\b}{useDextinityConfig}g; s{\bCometConfig\b}{DextinityConfig}g'
```

`@dextinity/brevo-admin` resolves its configuration via `DextinityConfigProvider` as well, so a project using the Brevo module needs no additional change beyond this rename.

The provider's props are unchanged.

### Rename the Admin Generator binary and config files

The binary and the config file suffix changed:

```diff title="admin/package.json"
{
    "scripts": {
-       "generate-admin": "comet-admin-generator generate",
+       "generate-admin": "dextinity-admin-generator generate",
    }
}
```

Rename every generator config file from `*.cometGen.tsx` to `*.dextinityGen.tsx` — the default file pattern is now `src/**/*.dextinityGen.{ts,tsx}`:

```sh
cd admin
git ls-files | grep -E "\.cometGen\.tsx?$" | while read -r file; do
    git mv "$file" "$(echo "$file" | perl -pe 's{\.cometGen\.(tsx?)$}{.dextinityGen.$1}')"
done
```

If the project passes an explicit file pattern to the generator (in a script or in `admin-generator` config), update it too:

```diff
- "generate-admin": "comet-admin-generator generate 'src/**/*.cometGen.tsx'",
+ "generate-admin": "dextinity-admin-generator generate 'src/**/*.dextinityGen.tsx'",
```

Then rerun the generator — the header of generated files changed to `// This file has been generated by Dextinity Admin Generator.`:

```sh
cd admin
npm run generate-admin
npm run gql:types
```

Commit the regenerated files if they are tracked, and update `.gitignore` patterns that reference `cometGen`.

### Update the translations

The library translations moved to a new repository, and the Format.js message ID prefix changed from `comet.*` (and `cometBrevoModule.*`) to `dextinity.*`.

Update the clone in the intl update script:

```diff title="admin/intl-update.sh"
- git clone https://github.com/vivid-planet/comet-lang.git lang/comet-lang
+ git clone https://github.com/vivid-planet/dextinity-lang.git lang/dextinity-lang
```

Update the compile script and the compiled output path:

```diff title="admin/package.json"
{
    "scripts": {
-       "intl:compile:comet": "formatjs compile-folder --format simple --ast lang/comet-lang lang-compiled/comet-lang",
+       "intl:compile:dextinity": "formatjs compile-folder --format simple --ast lang/dextinity-lang lang-compiled/dextinity-lang",
    }
}
```

And the imports that feed the messages into `IntlProvider`:

```diff title="admin/src/lang.ts"
- import comet_messages_de from "../lang-compiled/comet-lang/de.json";
- import comet_messages_en from "../lang-compiled/comet-lang/en.json";
+ import dextinity_messages_de from "../lang-compiled/dextinity-lang/de.json";
+ import dextinity_messages_en from "../lang-compiled/dextinity-lang/en.json";
```

Don't forget the CI workflows that clone the translations (`.github/workflows/*.yml`) and the `.gitignore` entries for `lang/` and `lang-compiled/`.

If your project **overrides individual library messages by ID**, rename those IDs:

```diff
  const messages = {
-     "comet.dam.uploadFile": "Upload asset",
+     "dextinity.dam.uploadFile": "Upload asset",
  };
```

```sh
git grep -n -E "\"comet(BrevoModule)?\.[a-zA-Z0-9_.]+\""
```

Project-owned message IDs are unaffected. If your project prefixes its own messages with `comet*` (e.g. `cometDemo.*`), renaming them is optional cleanup — but the `comet.*` prefix is reserved for library messages, so an override there will silently win over a library message.

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
cd admin
npm run lint
```

Repeat this step, fixing all lint errors, until the lint passes.

## Site

Run this section **once per site package**. Projects can have zero, one or many sites — find them with:

```sh
grep -l '"@comet/site-nextjs"\|"@dextinity/site-nextjs"' $(find . -name package.json -not -path '*/node_modules/*' -not -path '*/.next/*')
```

### Update the Dextinity dependencies

```diff title="site/package.json"
{
    "dependencies": {
-       "@comet/site-nextjs": "^9.0.0",
+       "@dextinity/site-nextjs": "10.0.0",
-       "@comet/site-react": "^9.0.0",
+       "@dextinity/site-react": "10.0.0",
    },
    "devDependencies": {
-       "@comet/eslint-config": "^9.0.0",
+       "@dextinity/eslint-config": "10.0.0",
    }
}
```

Then, install the updated dependencies:

```sh
npm install
```

### Rename the local storage cookie API

| v9                                                          | v10                                          |
| ----------------------------------------------------------- | -------------------------------------------- |
| `window.cometLocalStorageCookieApi`                         | `window.dextinityLocalStorageCookieApi`      |
| `comet-dev-cookie-api-consented-cookies` (localStorage key) | `dextinity-dev-cookie-api-consented-cookies` |

Update any project code or global type declaration that touches the window property:

```diff
  declare global {
      interface Window {
-         cometLocalStorageCookieApi?: CookieApi;
+         dextinityLocalStorageCookieApi?: CookieApi;
      }
  }
```

```sh
git grep -n -E "cometLocalStorageCookieApi|comet-dev-cookie-api-consented-cookies"
```

Previously consented cookies are reset in local development. Production consent handling is unaffected, since it doesn't use the dev localStorage API.

### Site preview and iframe messages

Two protocol details between site and admin were renamed:

- The `cometType` property of iframe messages is now `dextinityType`.
- The site preview cookie `__comet_site_preview` is now `__dextinity_site_preview`.

Both are handled inside the library. Update the site only if it reads them itself (e.g. a custom preview integration or a hard-coded cookie name):

```sh
git grep -n -E "cometType|__comet_site_preview"
```

:::caution Matching versions required

There is no compatibility layer. A v9 site with a v10 admin (or API) breaks the block preview and the site preview. Site, Admin and API must be on the same major and deployed together — see [Deployment](#deployment).

:::

### Regenerate the generated site files

```sh
cd site
npm run gql:types
npm run generate-block-types
```

<!-- "Verify lint passes" must always be the last step for this service. -->

### Verify lint passes

```sh
cd site
npm run lint
```

Repeat this step, fixing all lint errors, until the lint passes.

## Deployment

The rename crosses process boundaries, so a partial rollout is broken even though every service builds and lints.

### Deploy API, Admin and Site together

| Renamed across services         | Breaks if versions are mixed                          |
| ------------------------------- | ----------------------------------------------------- |
| `__dextinity_site_preview`      | Site preview (site sets the cookie, API validates it) |
| `dextinity-impersonate-user-id` | User impersonation (admin sets it, API reads it)      |
| `dextinityType` iframe messages | Block preview and site preview in the admin           |
| `Dextinity*Exception` codes     | DAM file upload error handling in the admin           |

### Update cookie names in infrastructure configuration

Anything outside the repository that matches on cookie names has to be updated in the same rollout: CDN cache keys and cache-bypass rules, reverse proxy or ingress configuration, WAF rules, and cookie allow-lists in consent tooling.

```sh
git grep -n -E "__comet_site_preview|comet-impersonate-user-id"
```

Check the Helm chart, CDN configuration and any infrastructure repository as well — those are usually not part of this repository.

### Run the database migration before starting the new API

The table rename ships as a library migration, so the standard `db:migrate` step in the deployment pipeline covers it. A v10 API against a not-yet-migrated database fails on the first query against the renamed tables.

## Final verification

### Search for leftover Comet references

Run a case-insensitive search across the whole repository and triage every hit:

```sh
git grep -n -i "comet"
```

Expected remaining hits:

- Existing database migrations under `api/src/db/migrations/`
- `comet-dxp.com/*` labels in Helm charts, if you didn't migrate them
- `@comet/dev-process-manager` and `@comet/dev-oidc-provider`, which are out of scope for v10
- Project-owned names that merely contain the word
- Changelog and archived documentation entries

Everything else is a missed step. Pay special attention to these patterns, which the per-section replacements are easy to miss:

```sh
git grep -n -E "@comet/|CometAdmin|createCometTheme|CometConfig|useCometConfig|Comet[A-Za-z]*Exception|CometAuthGuard|DisableCometGuards|--comet-admin-|cometType|cometGen|comet-lang|__comet_site_preview|comet-impersonate-user-id|cometLocalStorageCookieApi|comet-api-generator|comet-admin-generator|\"comet\\."
```

### Verify the whole project

```sh
npm run lint
npm run test
```

Then start the application and smoke-test the parts that the rename crosses process boundaries for:

- Log into the admin — the header shows the Dextinity logo
- Open a page in the page tree and check that the **block preview** renders
- Open the **site preview** from the admin
- **Upload a file in the DAM**, including an image that violates the configured resolution limit, and confirm the error message still renders
- **Impersonate a user** (if the project uses user permissions)
- If the project uses the Brevo module, open an email campaign and confirm the config resolves
