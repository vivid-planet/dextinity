---
"@dextinity/api-generator": patch
---

Add `tsconfig-paths` as a dependency

`dextinity-api-generator` registers `tsconfig-paths/register` at runtime, but the package only worked because `tsconfig-paths` happened to be hoisted from another package's dependencies. Declaring it directly ensures the CLI works when installed standalone.
