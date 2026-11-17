# Agent Instructions — @dextinity/mail-react

## About this package

[README.md](README.md) explains what this package is, the design decisions behind it (e.g. `useOptionalTheme()` over `useTheme()`), and the conventions its code follows. Read it before working in here. If a change reverses a decision or shifts a convention, update the README in the same PR.

When a change affects how the package is used (components, documented behavior, patterns, styling), update the usage guide in `src/docs/` — see _Usage documentation_ in the README. A fix inside the package that leaves its usage unchanged doesn't need it. The guide doesn't restate props, types, or defaults — those live in the package's types and TSDoc.

## When creating a changeset

Before adding a new changeset, check `.changeset/` at the repo root for an existing one covering the same feature (e.g. from an unmerged PR) — update it rather than creating a new file. Only add a new changeset when nothing existing fits.

## Running processes (dev-pm)

This package has two dev-pm scripts (see the `dev-pm` skill for command usage):

| Name                             | What it does                              |
| -------------------------------- | ----------------------------------------- |
| `mail-react`                     | `tsc --watch` — rebuilds `lib/` on change |
| `storybook-dextinity-mail-react` | `storybook dev -p 6066 --no-open`         |

The `@mail-react` group starts `mail-react`. Start `storybook-dextinity-mail-react` on its own, or with the `@storybook` group.

## Storybook

Storybook runs on a fixed port, `http://localhost:6066`, and serves an MCP server at `http://localhost:6066/mcp`.

### Story index API

Storybook exposes a machine-readable index of all stories at `GET /index.json`. Use this to discover stories without globbing the filesystem:

```bash
# List every story as "id — title — name"
curl -s http://localhost:6066/index.json \
  | jq -r '.entries | to_entries[] | "\(.key) — \(.value.title) — \(.value.name)"'

# Find a specific story id by title
curl -s http://localhost:6066/index.json \
  | jq -r '.entries[] | select(.title == "Layout Patterns/Symmetric Two-Column Layout") | .id'
```

### Viewing a story

To visually verify a change, open the isolated story iframe in a browser using the story's `id` from `index.json`:

```
http://localhost:6066/iframe.html?id=<id>&viewMode=story
```

## Scripts

Run these from `packages/mail-react/` (run `nvm use` first).

| Script     | Result                                                                                |
| ---------- | ------------------------------------------------------------------------------------- |
| `lint:fix` | Auto-fixes ESLint and Prettier issues in the source                                   |
| `lint`     | Reports all remaining lint, formatting, and TypeScript errors (does not fix anything) |
| `test`     | Runs the Vitest suite once and exits                                                  |

After making changes, run `pnpm run lint:fix` and then `pnpm run lint` to verify. TypeScript errors reported by `lint` must be fixed manually — `lint:fix` does not cover them.

## See also

- Usage guide: `src/docs/` — patterns and conventions for building emails with this package, served in the Storybook and its MCP server
