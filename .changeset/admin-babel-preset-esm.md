---
"@dextinity/admin-babel-preset": major
---

Publish the package as an ES module

The package is ESM-only now. Referencing the preset by name in a Babel config, for instance `"presets": ["@dextinity/admin-babel-preset"]` in `.babelrc.json`, keeps working.

Loading the preset directly with `require()` needs a Node version that supports `require(esm)`, and the preset is then available as the `default` property. Use `import` instead where possible:

```js
import dextinityAdminBabelPreset from "@dextinity/admin-babel-preset";
```
