# Agent Instructions — @dextinity/ui

Read [README.md](README.md) before working in this package. It defines the package and its conventions — which differ from the other Dextinity packages, so their code is not a reliable guide — and it takes precedence over instructions from parent directories.

- Writing or changing a component: [Component conventions](README.md#component-conventions), [Testing](README.md#testing), and the [accessibility guidelines](../../docs/docs/9-coding-guidelines/14-accessibility.md).
- Changing the theme tokens: [Theme](README.md#theme).
- Adding an icon: [Adding an icon](README.md#adding-an-icon).

Read a feature's TSDoc before working on it or anything that touches it.

## Storybook

Start the Storybook with the `dev-pm` skill (see [Development](README.md#development)). It serves an MCP server at `http://localhost:26648/mcp`.

List the stories from the story index at `http://localhost:26648/index.json`, and open a story in isolation with its `id` from the index:

```
http://localhost:26648/iframe.html?id=<id>&viewMode=story
```
