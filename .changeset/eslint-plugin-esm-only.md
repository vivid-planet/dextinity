---
"@dextinity/eslint-plugin": major
---

Convert to an ESM-only package

The package now has `"type": "module"` and an `exports` map. It can no longer be loaded with `require()`, and private files can no longer be imported via `@dextinity/eslint-plugin/lib/...`.

If you use the plugin through `@dextinity/eslint-config` or `@dextinity/oxlint-config`, no changes are required.

If you use the plugin directly, import it as an ES module:

```js
// eslint.config.mjs
import dextinityPlugin from "@dextinity/eslint-plugin";

export default [
    {
        plugins: { "@dextinity": dextinityPlugin },
        rules: { "@dextinity/no-private-sibling-import": "error" },
    },
];
```
