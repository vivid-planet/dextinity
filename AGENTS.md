# Agent Instructions

## Local Usage (IDE / CLI)

- you can expect setup is already done: all dependencies are installed and builds are done
- when making changes, affected packages need to be built, except the build watcher process is running (managed by dev-pm)
- services can be started by dev-pm

## Cloud / Web Usage (Fresh Clone)

When running in the cloud/web environment and repo is cloned from scratch, if required you can:

1. Install dependencies (**only** run if not yet done by eg. pipeline setup, check if `node_modules` exists)
    - `NODE_USE_ENV_PROXY=1 ./install.sh`
2. Run build for packages you are working on (**only** run if build file doesn't exist yet, check if `lib` exists in package)
    - `pnpm --recursive --filter '<package-name>' run build`

**If Docker is available:**

- You can start the full demo application using dev-pm and access it at localhost. Do **not** use docker compose directly, always use dev-pm and start `demo-docker`.

**If Docker is not available:**

- You cannot start the full demo application

When making changes to demo api, either start the api and verify it's running or at least run `pnpm run console --help` to verify AppModule is configured correctly and schema.gql/block-meta.json regenerates.

## Linting

Run the appropriate checks after every change and fix all reported errors.

### Post-Change Workflow

After making changes to any package (`packages/*`) or the demo project (`demo/*`), run `lint:fix` to auto-fix ESLint and Prettier issues:

```bash
# Fix a single package (from the package folder or repo root)
pnpm run lint:fix
# or from repo root:
pnpm --filter <package-name> run lint:fix

# Fix all packages at once (from repo root)
pnpm run lint:fix
```

`tsc` errors must be fixed manually — `lint:fix` does not cover type errors.

### `lint:fix` scripts

Every package and demo service exposes these scripts:

- `lint:fix` — runs `lint:fix:eslint` and `lint:fix:prettier` in parallel (plus `lint:fix:style` in `demo/site`)
- `lint:fix:eslint` — runs ESLint with `--fix` (also applies Prettier formatting via `eslint-plugin-prettier`)
- `lint:fix:prettier` — runs Prettier with `--write` for any remaining formatting issues
- `lint:fix:style` — runs Stylelint with `--fix` (`demo/site` only)

The root-level `lint:fix` runs all workspace `lint:fix` scripts recursively, then formats root-level config files.

### In `docs/`

Run from the `docs/` folder:

```bash
# Auto-fix ESLint + Prettier issues
pnpm run lint:fix

# Verify all checks pass: prettier, eslint
pnpm run lint
```

## Demo application

This repository includes a demo application which is showcasing the libraries.

**Api:**
Demo backend API (NestJS, PostgreSQL)

- Start using `pnpm exec dev-pm start @demo-api`
- access at: http://localhost:4000/

**Admin:**
Demo admin app (Vite, React, Apollo)

- Start using `pnpm exec dev-pm start @demo-admin`
- access at: http://localhost:8000/
- Usually Login as "Admin" in the IDP Login Page

**Site:**
Demo frontend site (Next.js)

- Start using `pnpm exec dev-pm start @demo-site`
- access at: http://localhost:3000/

### dev-pm

Use dev-pm for managing demo processes:

- command: `pnpm exec -- dev-pm`
- config: `dev-pm.config.ts`

Common commands:

- start script/service: `pnpm exec -- dev-pm start scriptName`
- start group `pnpm exec -- dev-pm start @group`
- view status `pnpm exec -- dev-pm status`
- view logs `pnpm exec -- dev-pm logs --lines 100 scriptName`

## Packages

### Admin (`packages/admin/`)

| Package                         | Description                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `@dextinity/admin`              | Core admin components and framework (React, MUI, Apollo, Final Form)                          |
| `@dextinity/admin-babel-preset` | Shared Babel preset for transpiling admin packages                                            |
| `@dextinity/admin-color-picker` | Color picker form field component                                                             |
| `@dextinity/admin-date-time`    | Date/time picker form field components                                                        |
| `@dextinity/admin-icons`        | SVG icon library as React components                                                          |
| `@dextinity/admin-rte`          | Rich text editor component (Draft.js-based)                                                   |
| `@dextinity/admin-generator`    | CLI tool that generates admin CRUD UIs from GraphQL schemas (`dextinity-admin-generator` bin) |
| `@dextinity/cms-admin`          | Admin UI for CMS features (pages, blocks, content management)                                 |
| `@dextinity/brevo-admin`        | Admin UI for Brevo email/marketing integration                                                |

### API (`packages/api/`)

| Package                    | Description                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `@dextinity/cms-api`       | NestJS/GraphQL API for CMS features (file uploads, translations, blocks, S3/Azure storage) |
| `@dextinity/brevo-api`     | NestJS integration for the Brevo email/marketing service                                   |
| `@dextinity/api-generator` | CLI tool that generates TypeScript types from GraphQL schemas (`dextinity-api-generator` bin)  |

### Site (`packages/site/`)

| Package                  | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `@dextinity/site-react`  | React components and utilities for the frontend/site layer    |
| `@dextinity/site-nextjs` | Next.js-specific site layer components (extends `site-react`) |

### Utilities

| Package                    | Description                                                      |
| -------------------------- | ---------------------------------------------------------------- |
| `@dextinity/cli`           | Central CLI entry point for Dextinity projects (`dextinity` bin) |
| `@dextinity/eslint-config` | Shared ESLint configurations                                     |
| `@dextinity/eslint-plugin` | Custom ESLint rules for Dextinity projects                       |
| `@dextinity/mail-react`    | Utilities for building HTML emails with React (MJML-based)       |

### Docs & Storybook

| Package               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `dextinity-storybook` | Storybook for all Dextinity components (`storybook/`) |
| `dextinity-docs`      | Docusaurus documentation site (`docs/`)               |

## Changesets and changelog

- We use Changesets for tracking changes. Create a non-empty changeset file when making relevant user-facing/package changes (not for docs-only, demo-only or internal-only updates).
- Important: See @CONTRIBUTING.md#changeset for detailed guidelines on when and how to add changesets.
- `CHANGELOG.md` is autogenerated; do not edit it manually.

### Quick changeset creation

To create a changeset file in `.changeset/` directory:

1. Create a markdown file with a descriptive kebab-case name
2. Add YAML frontmatter with package name and version bump type (patch/minor/major)
3. Write a clear description following the guidelines in CONTRIBUTING.md

Example:

```markdown
---
"@dextinity/package-name": patch
---

Fix description here
```

## Commit messages

- Do not use Conventional Commits.
- If a change is scoped to one package, prefix the commit message with the affected package name. Don't include `@dextinity/` in the package name.

## Generated demo files

- `demo/api` and `demo/admin` contain `generated/` folders. Do not edit files inside `generated/` directly; rerun `api-generator` or `admin-generator` to update them.
- After any changes to `api-generator` or `admin-generator` execute the generator in demo to update the generated files. Before running, build the package.

### admin-generator

The source for generated files are \*.dextinityGen.tsx config files. Modify those and re-run `admin-generator` for changes.

### api-generator

The source for generated files are entities, mainly the mikro-orm decorators but also custom `@Crud*` generators.
