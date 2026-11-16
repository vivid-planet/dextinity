---
"@dextinity/api-generator": patch
---

Use type-only imports in generated files for imports that are only used as types

For instance, `FindOptions` and `ObjectQuery` from `@mikro-orm/postgresql` and `BlockInputInterface` from `@dextinity/cms-api` are now imported with the `type` modifier.
This is required to compile the generated files with `isolatedModules` or `verbatimModuleSyntax`.
