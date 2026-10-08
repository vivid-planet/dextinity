---
"@dextinity/cms-admin": patch
---

Fix `ContentScopeControls`' `groupBy` fallback for scopes with different shapes

The fallback previously derived a `groupBy` dimension from the currently selected scope. If scopes have different shapes (e.g. `{ domain: "main" }` and `{ company: "123" }`), this could pick a dimension that other scopes don't have, breaking grouping when switching scopes. The fallback now only applies a `groupBy` dimension when every scope shares the exact same set of dimensions.
