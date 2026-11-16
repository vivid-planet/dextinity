---
"@dextinity/admin-babel-preset": major
---

Update Babel to v8

The preset now requires `@babel/core` v8.

It uses the development JSX transform only when `NODE_ENV` is set to `development`. Babel 8 would otherwise enable it whenever `NODE_ENV` isn't set.
