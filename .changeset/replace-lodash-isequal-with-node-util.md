---
"@dextinity/cms-api": patch
"@dextinity/brevo-api": patch
---

Replace the deprecated `lodash.isequal` dependency with Node's built-in `util`

`lodash.isequal` is deprecated and isn't needed — Node's `isDeepStrictEqual` from `util` covers the deep comparisons we use it for, with the same results for the compared values (plain JSON block data and content scopes). Both packages drop the `lodash.isequal` dependency.
