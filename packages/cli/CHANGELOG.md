# @comet/cli

## 10.1.0

## 10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/cli` to `@dextinity/cli`

    Update the dependency in `package.json`.

    **Breaking changes**
    - Rename the `comet` binary to `dextinity`:

        ```diff
        - "generate-block-types": "comet generate-block-types"
        + "generate-block-types": "dextinity generate-block-types"
        ```

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/cli` to `@dextinity/cli`

    Update the dependency in `package.json`.

    **Breaking changes**
    - Rename the `comet` binary to `dextinity`:

        ```diff
        - "generate-block-types": "comet generate-block-types"
        + "generate-block-types": "dextinity generate-block-types"
        ```

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

### Major Changes

- 2529907: Replace `install-agent-skills` with `install-agent-features` — a combined installer for agent skills and agent rules

    `install-agent-features` installs skills from `skills/<name>/SKILL.md` and `agentic-plugin/skills/<name>/SKILL.md` (folders) and rules from `rules/<name>.md` (single markdown files) — both from the local repo and from external git repos listed in `agent-features.json`. Skills install into `.agents/skills/` and `.claude/skills/`; rules install into `.agents/rules/`, `.claude/rules/`, `.cursor/rules/`, and `.github/instructions/` so they are picked up by Claude Code, Cursor, GitHub Copilot, and other cloud agents. Rules support the same optional `metadata.internal: true` frontmatter as skills, and may be organized into subdirectories (the layout is preserved in each target).

    Example `agent-features.json`:

    ```json
    {
        "repos": ["https://github.com/vivid-planet/comet.git"]
    }
    ```

    Run:

    ```sh
    npx @comet/cli install-agent-features
    ```

    **Breaking change:** the `install-agent-skills` command and its `agent-skills.json` config are removed. Migrate by renaming `agent-skills.json` to `agent-features.json` (the schema is identical) and replacing the `install-agent-skills` invocation in `package.json` and `install.sh` with `install-agent-features`.

### Minor Changes

- 644b4ee: Add node_modules skills and rules discovery to `install-agent-features` command

    The command now scans direct dependencies in `node_modules` (including `@scoped` packages) for `skills/` and `rules/` directories and creates symlinks to agent-specific directories. This is compatible with the [npm-based Agent Skills convention](https://github.com/antfu/skills-npm/blob/HEAD/PROPOSAL.md) and extends it to also support rules.

- 9746947: `install-agent-skills`: also install skills from `agentic-plugin/skills/`

    In addition to the existing `skills/` directory, the command now installs skills from `agentic-plugin/skills/`. This allows shipping agent skills as part of a Claude Code plugin (with a `.claude-plugin/plugin.json` manifest) without losing the ability to install them via `install-agent-skills`.

    Both directories are also fetched (via git sparse checkout) when consuming external repos listed in `agent-skills.json`. `skills/` keeps priority over `agentic-plugin/skills/`.

### Patch Changes

- 560a8f2: Cache `getSiteConfigs` and `op read` calls to avoid redundant execution

    When a template contains multiple placeholders for the same environment, `getSiteConfigs(env)` and `op read` were called repeatedly with identical arguments. Both are now cached per invocation so each unique `env` and each unique `op://` URI is resolved only once.

- b459ec7: Reduce published package size by keeping non-runtime build artifacts out of the bundle

## 9.0.0-beta.6

### Patch Changes

- b459ec7: Reduce published package size by keeping non-runtime build artifacts out of the bundle

## 9.0.0-beta.5

### Minor Changes

- 644b4ee: Add node_modules skills and rules discovery to `install-agent-features` command

    The command now scans direct dependencies in `node_modules` (including `@scoped` packages) for `skills/` and `rules/` directories and creates symlinks to agent-specific directories. This is compatible with the [npm-based Agent Skills convention](https://github.com/antfu/skills-npm/blob/HEAD/PROPOSAL.md) and extends it to also support rules.

## 9.0.0-beta.4

### Major Changes

- 2529907: Replace `install-agent-skills` with `install-agent-features` — a combined installer for agent skills and agent rules

    `install-agent-features` installs skills from `skills/<name>/SKILL.md` and `agentic-plugin/skills/<name>/SKILL.md` (folders) and rules from `rules/<name>.md` (single markdown files) — both from the local repo and from external git repos listed in `agent-features.json`. Skills install into `.agents/skills/` and `.claude/skills/`; rules install into `.agents/rules/`, `.claude/rules/`, `.cursor/rules/`, and `.github/instructions/` so they are picked up by Claude Code, Cursor, GitHub Copilot, and other cloud agents. Rules support the same optional `metadata.internal: true` frontmatter as skills, and may be organized into subdirectories (the layout is preserved in each target).

    Example `agent-features.json`:

    ```json
    {
        "repos": ["https://github.com/vivid-planet/comet.git"]
    }
    ```

    Run:

    ```sh
    npx @comet/cli install-agent-features
    ```

    **Breaking change:** the `install-agent-skills` command and its `agent-skills.json` config are removed. Migrate by renaming `agent-skills.json` to `agent-features.json` (the schema is identical) and replacing the `install-agent-skills` invocation in `package.json` and `install.sh` with `install-agent-features`.

## 9.0.0-beta.3

### Minor Changes

- 9746947: `install-agent-skills`: also install skills from `agentic-plugin/skills/`

    In addition to the existing `skills/` directory, the command now installs skills from `agentic-plugin/skills/`. This allows shipping agent skills as part of a Claude Code plugin (with a `.claude-plugin/plugin.json` manifest) without losing the ability to install them via `install-agent-skills`.

    Both directories are also fetched (via git sparse checkout) when consuming external repos listed in `agent-skills.json`. `skills/` keeps priority over `agentic-plugin/skills/`.

### Patch Changes

- 560a8f2: Cache `getSiteConfigs` and `op read` calls to avoid redundant execution

    When a template contains multiple placeholders for the same environment, `getSiteConfigs(env)` and `op read` were called repeatedly with identical arguments. Both are now cached per invocation so each unique `env` and each unique `op://` URI is resolved only once.

## 9.0.0-beta.2

## 9.0.0-beta.1

## 9.0.0-beta.0

## 8.20.0

### Minor Changes

- 7c27867: `install-agent-skills`: add support for a `skills/` directory as the primary source for agent skills

    The `project-skills/` and `package-skills/` directories are no longer supported. Move all skills into a single `skills/` directory at the repo root:
    - Skills previously in `project-skills/`: move to `skills/` and add `metadata.internal: true` to their `SKILL.md`
    - Skills previously in `package-skills/`: move to `skills/` (without the `internal` flag)

## 8.19.0

### Minor Changes

- 539d53f: Add `install-agent-skills` command

    see https://docs.comet-dxp.com/docs/guides/installing-agent-skills for more info

## 8.18.0

## 8.17.1

## 8.17.0

## 8.16.0

## 8.15.0

### Minor Changes

- 7740f1e: Support 1Password references in site configs

    Allows referencing secrets stored in 1Password directly in the site config using the `{{ op://... }}` syntax. For example:

    ```ts site-configs/your-site.ts
    export default ((env) => {
        return {
            // ,,,
            apiKey: `{{ op://example-project-prod/api-key/password }}`,
        };
    }) satisfies GetSiteConfig;
    ```

    They are then replaced with the actual values by `inject-site-configs`.

## 8.14.0

## 8.13.0

## 8.12.0

### Minor Changes

- 979a1d3: Use renovate for updating local oauth2-proxy and mitmproxy

## 8.11.1

## 8.11.0

## 8.10.0

## 8.9.0

## 8.8.0

## 8.7.1

## 8.7.0

## 8.6.0

### Minor Changes

- 4c452a1: Add download-mitmproxy command

## 8.5.2

## 8.5.1

## 8.5.0

## 8.4.2

## 8.4.1

## 8.4.0

### Minor Changes

- c8f5d89: Add support for literal arrays to block meta

## 8.3.0

## 8.2.0

## 8.1.1

## 8.1.0

## 8.0.0

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

- 23335c6: Remove workarounds in `inject-site-configs` command.

    Please use the command like the current implementation in the starter.

### Minor Changes

- 5164ad3: comet generate-block-types generates now `AllBlockNames` type, which contains a string union for all blocks

## 8.0.0-beta.6

### Minor Changes

- 5164ad3: comet generate-block-types generates now `AllBlockNames` type, which contains a string union for all blocks

## 8.0.0-beta.5

### Major Changes

- 23335c6: Remove workarounds in `inject-site-configs` command.

    Please use the command like the current implementation in the starter.

## 8.0.0-beta.4

## 8.0.0-beta.3

## 8.0.0-beta.2

### Major Changes

- f904b71: Require Node v22

    The minimum required Node version is now v22.0.0.
    See the migration guide for instructions on how to upgrade your project.

## 8.0.0-beta.1

## 8.0.0-beta.0

## 7.25.3

## 7.25.2

## 7.25.1

## 7.25.0

## 7.24.0

## 7.23.0

## 7.22.0

## 7.21.1

## 7.21.0

## 7.20.0

## 7.19.0

## 7.18.0

## 7.17.0

## 7.16.0

## 7.15.0

## 7.14.0

## 7.13.0

## 7.12.0

### Minor Changes

- 753cd6f04: Add option for base64 encoding in `inject-site-configs` command

## 7.11.0

## 7.10.0

## 7.9.0

## 7.8.0

## 7.7.0

## 7.6.0

### Minor Changes

- d353fc847: The `inject-site-configs` command locates the site-config-file argument relative to the current directory
- 9e2b0fac8: Add support for literal arrays to block meta

    String, number, boolean, and JSON arrays can be defined by setting `array: true`.

    **Example**

    ```ts
    class NewsListBlockData {
        @BlockField({ type: "string", array: true })
        newsIds: string[];
    }
    ```

## 7.5.0

### Patch Changes

- bc0570ff2: Fix setting prelogin domain for deployment with site-configs

## 7.4.2

## 7.4.1

## 7.4.0

### Patch Changes

- a101ed6f5: inject-site-configs: Add sane defaults for preloginEnabled

    When `preloginEnabled` is `undefined` or `null` set it to `true`
    on environments != `prod` or `local`.

## 7.3.2

## 7.3.1

## 7.3.0

## 7.2.1

## 7.2.0

## 7.1.0

## 7.0.0

## 7.0.0-beta.6

## 7.0.0-beta.5

## 7.0.0-beta.4

## 7.0.0-beta.3

## 7.0.0-beta.2

## 7.0.0-beta.1

## 7.0.0-beta.0

## 6.17.1

## 6.17.0

## 6.16.0

## 6.15.1

## 6.15.0

## 6.14.1

## 6.14.0

## 6.13.0

## 6.12.0

## 6.11.0

## 6.10.0

## 6.9.0

## 6.8.0

### Minor Changes

- 360b8b137: Add `--input-file` and `--output-file` options to generate-block-types script for enhanced flexibility.

## 6.7.0

## 6.6.2

## 6.6.1

## 6.6.0

## 6.5.0

## 6.4.0

## 6.3.0

## 6.2.1

## 6.2.0

## 6.1.0

## 6.0.0

## 5.6.0

## 5.5.0

## 5.4.0

## 5.3.0

## 5.2.0

## 5.1.0

## 5.0.0

## 4.7.0

## 4.6.0

## 4.5.0

## 4.4.3

## 4.4.2

## 4.4.1

## 4.4.0

## 4.3.0

## 4.2.0

## 4.1.0
