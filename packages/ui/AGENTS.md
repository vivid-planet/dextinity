# Agent Instructions — @dextinity/ui

Read [README.md](README.md) before working in this package. It defines the package and its conventions — which differ from the other Dextinity packages, so their code is not a reliable guide — and it takes precedence over instructions from parent directories.

- Writing or changing a component: [Component conventions](README.md#component-conventions) and [Testing](README.md#testing).
- Changing the theme tokens: [Theme](README.md#theme).

Components and utilities are documented in TSDoc on the export (see [TSDoc](README.md#tsdoc)); read a feature's TSDoc before working on it or anything that touches it. When a change shifts a convention, reverses a decision, or makes documentation inaccurate, update the affected TSDoc — and the README, when a convention changes — in the same change.

## Running processes (dev-pm)

This package has two dev-pm scripts (see the `dev-pm` skill for command usage):

| Name                     | What it does                                                      |
| ------------------------ | ----------------------------------------------------------------- |
| `dextinity-ui`           | `vite build --watch` and `tsc --watch` — rebuild `lib/` on change |
| `storybook-dextinity-ui` | `storybook dev -p 26648 --no-open`                                |

The `@dextinity-ui` group starts `dextinity-ui`. Start `storybook-dextinity-ui` on its own, or with the `@storybook` group.

## Storybook

Storybook runs on a fixed port, `http://localhost:26648`, and serves an MCP server at `http://localhost:26648/mcp`.

List the stories from the story index at `http://localhost:26648/index.json`, and open a story in isolation with its `id` from the index:

```
http://localhost:26648/iframe.html?id=<id>&viewMode=story
```
