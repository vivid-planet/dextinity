# Agent Instructions — @dextinity/eslint-plugin

## Rules

Each rule lives in `src/rules/<rule-name>.ts`, next to its test `src/rules/<rule-name>.test.ts`, and is registered in `src/index.ts`. The rules also run as an Oxlint JS plugin, so use only the ESLint rule APIs that Oxlint supports.

When adding a rule:

- Set `meta.docs.description` and `meta.docs.url`. The URL points to `https://github.com/vivid-planet/dextinity/blob/main/packages/eslint-plugin/docs/rules/<rule-name>.md`.
- Add the rule page `docs/rules/<rule-name>.md`. Below the generated header, explain why the rule exists and add the sections "Examples", "Options" (only when the rule has options) and "Presets".
- Enable it in the presets of `@dextinity/eslint-config` and `@dextinity/oxlint-config` where it applies, and name those presets on the rule page.

## Generated docs

`eslint-doc-generator` generates the rules list in `README.md` and the header of each `docs/rules/*.md` from the rules' `meta`. Edit only the content outside the generator's marker comments.

The generator loads the built plugin from `lib/`. After adding a rule or changing a rule's `meta`, build the package and regenerate the docs:

```bash
pnpm --filter @dextinity/eslint-plugin run build
pnpm --filter @dextinity/eslint-plugin run docs:generate
```

The `lint` script runs the generator with `--check` and fails when the generated docs are outdated.
