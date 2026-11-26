# @comet/agent-features

## 10.16.0

### Minor Changes

- aa7c8fc: Add skills for generating CRUD features

    `dextinity-crud` generates the API and admin UI for an entity from a short description. It shows a plan first, then uses the other new skills, which also work on their own:

    - `dextinity-api-graphql`: GraphQL resolver, DTOs and permission for a MikroORM entity, in the style of `api-generator`
    - `dextinity-admin-enum`: translated labels, chips and form fields for GraphQL enums
    - `dextinity-admin-datagrid`: server-side DataGrid with filtering, sorting, search and pagination
    - `dextinity-admin-form`: Final Form edit form with create and edit modes and save conflict detection
    - `dextinity-admin-pages`: page navigation with `Stack`, `StackSwitch`, `RouterTabs` and `EditDialog`

### Patch Changes

- 9be7f9d: Point the `dextinity-mail-react` skill to the `@dextinity/mail-react` Storybook

    The usage guide for building emails moved into the Storybook of `@dextinity/mail-react`. The skill now tells the agent to read it through the Storybook's MCP server, and how to connect the server.

## 10.15.0

No changes in this release.

## 10.14.0

No changes in this release.

## 10.13.1

## 10.13.0

## 10.12.0

## 10.11.0

## 10.10.0

## 10.9.1

## 10.9.0

### Patch Changes

- a29e8fb: Teach the `dextinity-block` skill to write and maintain block descriptions

    The skill adds a `description` where a block's name and fields don't say what the block is for, switching `createBlock` to its options form for it, and updates the description when the block's purpose changes.

- 2a1aba3: Limit the TypeScript rule about `@src/…` imports to projects that define the alias

    Library packages compiled with plain `tsc` can't use path aliases, because `tsc` doesn't rewrite them in its output.
    Agents and review bots no longer flag their relative imports of ancestor files.

## 10.8.0

## 10.7.0

## 10.6.0

## 10.5.1

## 10.5.0

## 10.4.0

## 10.3.0

## 10.2.0

## 10.1.0

## 10.0.1

### Patch Changes

- 823d663: Fix the package being published without any skills and rules

    The `skills/` and `rules/` folders were symlinked to the folders at the repository root. Since pnpm v11 no longer follows symlinked directories when packing, every release since `@comet/agent-features` v9.4.0 contained nothing but the manifest, so `dextinity install-agent-features` found no skills or rules to install. The folders are copied into the package when it's built now.

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/agent-features` to `@dextinity/agent-features`

    Update the dependency in `package.json`.

    **Breaking changes**
    - Rename the skills to Dextinity: `comet-admin-ui` -> `dextinity-admin-ui`, `comet-block` -> `dextinity-block`, `comet-core-admin-component-authoring` -> `dextinity-core-admin-component-authoring`, `comet-mail-react` -> `dextinity-mail-react`, `comet-major-migration` -> `dextinity-major-migration` and `comet-minor-update` -> `dextinity-minor-update`. Rerun `dextinity install-agent-features` and remove the previously installed skills

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/agent-features` to `@dextinity/agent-features`

    Update the dependency in `package.json`.

    **Breaking changes**
    - Rename the skills to Dextinity: `comet-admin-ui` -> `dextinity-admin-ui`, `comet-block` -> `dextinity-block`, `comet-core-admin-component-authoring` -> `dextinity-core-admin-component-authoring`, `comet-mail-react` -> `dextinity-mail-react`, `comet-major-migration` -> `dextinity-major-migration` and `comet-minor-update` -> `dextinity-minor-update`. Rerun `dextinity install-agent-features` and remove the previously installed skills

## 9.5.0

## 9.4.0

## 9.3.0

## 9.2.2

## 9.2.1

## 9.2.0

## 9.1.1

## 9.1.0

## 9.0.1

## 9.0.0

### Minor Changes

- ca5b0fa: Add `@comet/agent-features` package containing skills and rules for AI coding agents

## 9.0.0-beta.6

## 9.0.0-beta.5

### Minor Changes

- ca5b0fa: Add `@comet/agent-features` package containing skills and rules for AI coding agents

## 9.0.0-beta.3
