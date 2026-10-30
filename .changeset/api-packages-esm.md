---
"@dextinity/api-generator": major
"@dextinity/brevo-api": major
"@dextinity/cms-api": major
---

Publish the API packages as ES modules

Applications need to be converted to ESM as well: a CommonJS application would load dependencies that ship separate CommonJS and ESM builds twice, for instance two copies of the `graphql-scalars` types, which breaks the GraphQL schema. See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for the required steps.

The API Generator generates ESM code: relative imports get a `.js` extension.
