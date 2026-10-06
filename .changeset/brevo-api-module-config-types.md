---
"@dextinity/brevo-api": patch
---

Fix `BrevoModuleConfig` resolving to `any` for some options

The type declarations referenced types through paths that only resolved inside the package. `brevo.resolveConfig` and `emailCampaigns.frontend` are typed now, and still accept a function that narrows the scope to the application's scope type.
