---
"@dextinity/brevo-api": patch
---

Fix unresolvable `src/...` imports in the published type declarations

Some type declarations imported internal types via `src/...`, which can't be resolved in consuming projects. As a result, parts of the `BrevoModule.register()` config, for instance `EmailCampaignScopeInterface`, silently became `any`.

Now that the config is type-checked, `BrevoModule.register()` infers the scope type from `emailCampaigns.Scope`. The `brevo.resolveConfig` and `emailCampaigns.frontend` callbacks can therefore be typed with the application's own scope class:

```ts
BrevoModule.register({
    brevo: {
        resolveConfig: (scope: EmailCampaignContentScope) => {
            /* ... */
        },
        // ...
    },
    emailCampaigns: {
        Scope: EmailCampaignContentScope,
        frontend: (scope: EmailCampaignContentScope) => {
            /* ... */
        },
        // ...
    },
});
```

Because the config was previously typed as `any` in consuming projects, invalid configs may now cause type errors that were hidden before.
