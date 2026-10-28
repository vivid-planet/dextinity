---
"@dextinity/eslint-config": patch
---

Move `npm-run-all2` to `devDependencies`

It's only used by the package's own lint scripts, so projects using `@dextinity/eslint-config` no longer install it.
