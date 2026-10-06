---
"@dextinity/api-generator": major
"@dextinity/brevo-api": major
"@dextinity/cms-api": major
---

Publish the API packages as ES modules

The packages are ESM-only now and only expose their entry points through an `exports` map. Deep imports such as `@dextinity/cms-api/lib/...` no longer resolve.

Applications need to be converted to ESM as well: a CommonJS application would load dependencies that ship separate CommonJS and ESM builds twice, for instance two copies of the `graphql-scalars` types, which breaks the GraphQL schema. See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required steps.

The API Generator generates ESM code: relative imports get a `.js` extension, and type-only imports are marked with `type`. It loads the entities with the TypeScript loader configured for the MikroORM CLI instead of `ts-node`.
