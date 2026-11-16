---
"@dextinity/api-generator": major
---

Load the entities with the TypeScript loader configured for the MikroORM CLI

The API Generator no longer registers `ts-node` itself. It uses the loader the MikroORM CLI uses, for instance `@swc-node/register`, so the project needs one of the loaders the MikroORM CLI supports.
