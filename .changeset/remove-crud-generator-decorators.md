---
"@dextinity/cms-api": major
---

Remove the `@CrudGenerator` and `@CrudSingleGenerator` decorators

The API Generator, which read them, has been removed. Remove the decorators from your entities. `@CrudField` stays, as its `search` option controls which fields `searchToMikroOrmQuery` searches.

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required steps.
