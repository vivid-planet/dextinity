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
