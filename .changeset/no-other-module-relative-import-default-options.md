---
"@dextinity/eslint-plugin": patch
---

Fall back to the default for each missing option of the `no-other-module-relative-import` rule

Previously, passing only `sourceRoot` or only `sourceRootAlias` left the other option `undefined` instead of using its default (`./src` / `@src`).
