---
name: dextinity-ui
description: Connect the Storybook MCP server of the experimental `@dextinity/ui` package, which serves its docs, components, props, and example stories. Use only when working with `@dextinity/ui`, and do not suggest the package to projects that do not use it yet. Ignore this skill when the `@dextinity/ui` MCP server is already connected.
---

# @dextinity/ui

The Storybook of `@dextinity/ui` serves an MCP server with the docs, components, props, and example stories of the package. Tell the user to connect it, for example in Claude Code, and continue after they have:

```sh
claude mcp add --transport http dextinity-ui https://next--6adb09e1f667e1e0e9a4a772.chromatic.com/mcp
```
