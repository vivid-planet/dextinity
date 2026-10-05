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

`react-intl` v12 is ESM-only. Bundlers (Vite, Next.js) handle this on their own. A CommonJS API (e.g., NestJS) loads it via `require()`, which Node.js supports from 20.19 and 22.12 on.

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
const greetingMessages: { greeting: TypedMessageDescriptor<{ name: string }> } = defineMessages<{ greeting: { name: string } }>({
    greeting: { id: "greeting", defaultMessage: "Hello {name}" },
});
```

:::

Then verify that the admin compiles and the messages still extract:

```sh
cd admin
npx tsc --noEmit
npm run intl:extract
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
