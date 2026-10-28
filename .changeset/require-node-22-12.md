---
"@dextinity/admin-babel-preset": patch
"@dextinity/admin-color-picker": patch
"@dextinity/admin-date-time": patch
"@dextinity/admin-generator": patch
"@dextinity/admin-icons": patch
"@dextinity/admin-rte": patch
"@dextinity/admin": patch
"@dextinity/api-generator": patch
"@dextinity/cli": patch
"@dextinity/cms-admin": patch
"@dextinity/cms-api": patch
"@dextinity/eslint-config": patch
"@dextinity/eslint-plugin": patch
"@dextinity/mail-react": patch
"@dextinity/site-nextjs": patch
"@dextinity/site-react": patch
---

Require Node.js 22.12.0 or later

`@dextinity/cms-api` is a CommonJS package that loads dependencies which are only available as ES modules, for instance `content-disposition`.
Node.js supports loading ES modules with `require()` without a flag only from version 22.12.0.
On older versions, the API fails at startup with `ERR_REQUIRE_ESM`.
The other packages require the same version, so that all packages have the same Node.js minimum.
For `@dextinity/site-react` and `@dextinity/site-nextjs`, this drops support for Node.js 18 and 20, which no longer receive security updates.
