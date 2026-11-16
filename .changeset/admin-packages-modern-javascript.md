---
"@dextinity/admin": patch
"@dextinity/admin-color-picker": patch
"@dextinity/admin-date-time": patch
"@dextinity/admin-icons": patch
"@dextinity/admin-rte": patch
"@dextinity/brevo-admin": patch
"@dextinity/cms-admin": patch
---

Publish modern JavaScript instead of ES5

The admin packages are now built with Babel 8, which compiles for the browserslist `defaults` query instead of ES5 when no targets are set. Your admin's bundler still transpiles the code for the browsers your project supports.
