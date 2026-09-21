---
"@dextinity/admin-generator": major
---

Import `deepEqual` from `fast-equals` in generated forms

Generated forms imported `isEqual` from `lodash.isequal`, which is deprecated on npm. They now import `deepEqual` from `fast-equals` instead.

**Migration**

Add `fast-equals` to your admin application and regenerate:

```bash
pnpm add fast-equals
```

Afterwards, remove `lodash.isequal` and `@types/lodash.isequal` unless your own code still uses them.
