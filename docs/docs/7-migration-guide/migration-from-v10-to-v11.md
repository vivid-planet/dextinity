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

## What changes in v11

This guide is a work in progress and is extended as breaking changes land on the next major.

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

### Verify

```sh
npm run lint
```
