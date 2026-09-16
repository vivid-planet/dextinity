---
"@dextinity/brevo-api": patch
"@dextinity/cms-api": patch
---

Move `ScopeInterface` to the user permissions module

Page tree, redirects, DAM and email campaigns each declared their own scope type (`ScopeInterface`, `RedirectScopeInterface`, `DamScopeInterface`, `EmailCampaignScopeInterface`) with identical definitions. They are replaced by the single `ScopeInterface` exported from `@dextinity/cms-api`, next to `ContentScope`.

`BrevoModuleConfig` previously referenced its scope type through a package-internal import that consumers couldn't resolve, so the scope of `brevo.resolveConfig` and `emailCampaigns.frontend` silently degraded to `any`. Those callbacks now receive a `ScopeInterface`, which can surface type errors in applications that annotate the parameter with their own scope class:

```ts
BrevoModule.register({
    brevo: {
        // Let the scope type be inferred instead of annotating it
        resolveConfig: (scope) => ({ apiKey, redirectUrlForImport: urlFor(scope.domain) }),
        // ...
    },
    // ...
});
```
