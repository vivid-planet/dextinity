---
"@comet/cms-api": patch
---

Validate the GraphQL type names of a custom `PageTreeNode` scope passed to `PageTreeModule.forRoot()`

`PageTreeModule.forRoot()` now throws an error at startup if the provided `Scope` class isn't decorated with `@ObjectType("PageTreeNodeScope")` and `@InputType("PageTreeNodeScopeInput")`, mirroring the existing validation for `DamModule`'s `Scope` option. This prevents runtime GraphQL schema errors caused by an accidentally renamed scope type.
