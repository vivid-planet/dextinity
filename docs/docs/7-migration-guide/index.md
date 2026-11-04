---
title: Migration Guide
---

This chapter contains instructions for migrating from one Dextinity version to another.
Each major version should be upgraded separately.

How to perform a migration depends on the target version.

## AI-assisted migration (v9 and later)

Starting with the migration from v8 to v9, the migration guides are designed to be executed by an AI coding agent (e.g., Claude Code).
Each section contains structured, step-by-step instructions that the agent follows to perform the migration.

Point your agent to the migration guide of the target version and let it work through the sections in order.
Each guide contains a sample prompt to get started.

:::tip

The `dextinity-major-migration` agent skill guides the agent through a major migration, including locating the guide and choosing the target version.
Install it with [`install-agent-features`](../guides/installing-agent-features).

:::

## @comet/upgrade (up to v8)

For migrations up to v8, codemods for automated updates, such as renames, are available at [@comet/upgrade](https://github.com/vivid-planet/comet-upgrade).

Example usage for upgrading from v4 to v5:

```
npx @comet/upgrade v5
```

:::caution

Codemods are designed to ensure that upgrades are as smooth as possible, so their use is highly recommended.

:::
