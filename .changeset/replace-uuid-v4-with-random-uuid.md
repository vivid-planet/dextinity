---
"@dextinity/admin": patch
"@dextinity/admin-icons": patch
"@dextinity/brevo-api": patch
"@dextinity/cms-admin": patch
---

Remove the `uuid` dependency

Random UUIDs are now generated with `crypto.randomUUID()`.

Browsers only provide `crypto.randomUUID()` in a secure context, so the admin must be served over HTTPS or from `localhost`.
