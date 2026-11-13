# Agent Instructions — @dextinity/ui-react-hook-form

Read [README.md](README.md) before working in this package, and the [README of `@dextinity/ui`](../ui/README.md) for the conventions it follows. Both take precedence over instructions from parent directories.

- The adapter names, props, value mapping, and form helpers are shared with `@dextinity/ui-react-final-form`. A change to that contract changes both packages and both READMEs in the same change.
- Adding a value-holding control to `@dextinity/ui` adds its adapter in `src/fields/<fieldName>/` here and in `@dextinity/ui-react-final-form`, with a story and a row in the "Adapters" table.

## Running processes (dev-pm)

| Name                                     | What it does                                                      |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `dextinity-ui-react-hook-form`           | `vite build --watch` and `tsc --watch` — rebuild `lib/` on change |
| `storybook-dextinity-ui-react-hook-form` | This package's Storybook at `http://localhost:26651`              |

The `@dextinity-ui` group starts the build watcher together with `dextinity-ui`; the `@storybook` group starts the Storybook.

## Storybook

The stories have their own Storybook (`storybook-dextinity-ui-react-hook-form`, `http://localhost:26651`), composed into the root Storybook. It uses the built `@dextinity/ui`, so a change to a ui component shows once `dextinity-ui` has rebuilt `lib/`.
