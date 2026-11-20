---
"@dextinity/cms-api": major
---

Replace `@CrudField` with `@Searchable`

Only the `search` option of `@CrudField` was still read, by `searchToMikroOrmQuery` and `gqlArgsToMikroOrmQuery`. All other options were only read by the removed API Generator. String, text and UUID fields, including those of many-to-one relations, are searched unless they're marked as not searchable:

```diff
- @CrudField({ search: false })
+ @Searchable(false)
  internalNote: string;
```

Remove `@CrudField` where it doesn't set `search: false`.

`CrudFieldOptions` is removed. `getCrudSearchFieldsFromMetadata` is renamed to `getSearchFieldsFromMetadata`. `hasCrudFieldFeature(entityClass, propName, "search")` is replaced with `isSearchable(entityClass, propName)`.

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required steps.
