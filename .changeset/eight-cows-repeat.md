---
"@dextinity/cms-api": patch
---

Fix scope validation in `PageTreeModule.forRoot` and `DamModule.register` rejecting correctly decorated scope classes

`@InputType()` doesn't register its metadata immediately, it only queues the registration until a GraphQL schema is built. Since the scope is validated while the module is being defined, the queued registration hadn't run yet and a scope class decorated with `@InputType("PageTreeNodeScopeInput")` could be rejected with:

```
Error: Invalid input type name for provided page tree scope class.
Make sure to decorate the class with @InputType("PageTreeNodeScopeInput")
```

The queued registrations are now executed before the scope is validated.
