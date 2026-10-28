---
"@dextinity/brevo-api": patch
---

Remove the `uuid` dependency

Random UUIDs are now generated with `randomUUID()` from Node's `crypto` module.
