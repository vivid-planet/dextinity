---
"@dextinity/admin-generator": minor
---

Import `isEqual` from `@dextinity/admin` in generated forms

Generated forms imported `isEqual` from `lodash.isequal`, which forced every project using the generator to install that deprecated package. They now import `isEqual` from `@dextinity/admin` instead.

After regenerating, remove `lodash.isequal` and `@types/lodash.isequal` from your admin `package.json` unless your own code still uses them.
