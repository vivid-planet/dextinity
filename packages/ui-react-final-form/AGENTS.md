# Agent Instructions — @dextinity/ui-react-final-form

Read [README.md](README.md) before working in this package, and the [README of `@dextinity/ui`](../ui/README.md) for the conventions it follows. Both take precedence over instructions from parent directories.

- The adapter names, props, value mapping, and form helpers are shared with `@dextinity/ui-react-hook-form`. A change to that contract changes both packages and both READMEs in the same change.
- Adding a value-holding control to `@dextinity/ui` adds its adapter in `src/fields/<fieldName>/` here and in `@dextinity/ui-react-hook-form`, with a story and a row in the "Adapters" table.

## Running processes (dev-pm)

| Name                            | What it does                                                      |
| ------------------------------- | ----------------------------------------------------------------- |
| `dextinity-ui-react-final-form` | `vite build --watch` and `tsc --watch` — rebuild `lib/` on change |

The `@dextinity-ui` group starts it together with `dextinity-ui`.

## Storybook

The stories are part of the `@dextinity/ui` Storybook (`storybook-dextinity-ui`, `http://localhost:26648`), under `Forms/Final Form`. Storybook aliases `@dextinity/ui` to its source, so a change to a ui component shows without a build.
