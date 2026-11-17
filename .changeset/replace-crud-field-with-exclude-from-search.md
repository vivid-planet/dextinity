---
"@dextinity/cms-api": major
---

Replace `@CrudField` with `@ExcludeFromSearch`

Only the `search` option of `@CrudField` was still read, by `searchToMikroOrmQuery` and `gqlArgsToMikroOrmQuery`. All other options were only read by the removed API Generator. Every string field is searched unless it's excluded:

```diff
- @CrudField({ search: false })
+ @ExcludeFromSearch()
  internalNote: string;
```

Remove `@CrudField` where it doesn't set `search: false`.

`getCrudSearchFieldsFromMetadata` and `hasCrudFieldFeature` are renamed to `getSearchFieldsFromMetadata` and `isExcludedFromSearch`. `isExcludedFromSearch` no longer takes an option.

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required steps.
