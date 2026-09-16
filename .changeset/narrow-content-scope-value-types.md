---
"@dextinity/cms-api": major
"@dextinity/brevo-api": major
"@dextinity/cms-admin": major
"@dextinity/site-nextjs": major
---

Derive the module scope interfaces from `ContentScope`

The scope interfaces accepted values of any type (`Record<string, any>`, `[key: string]: unknown`), which hid mistakes such as passing a scope class instead of a scope instance, or wrapping a scope in another object.
They are now `ModuleContentScope`, which takes its dimensions from the `ContentScope` interface an application declares once:

```ts
declare module "@dextinity/cms-api" {
    interface ContentScope {
        domain: string;
        language: string;
    }
}
```

- `ScopeInterface` (page tree), `RedirectScopeInterface` and `DamScopeInterface` in `@dextinity/cms-api`
- `EmailCampaignScopeInterface` in `@dextinity/brevo-api`

Every dimension is optional, so a module may use a subset of them, for instance a DAM scoped by domain while pages are scoped by domain and language.
A dimension of a type other than `string`, `number`, `null` or `undefined` makes the scope class that declares it unassignable to the module it is passed to, and the error names the dimension.

`ContentScope` in `@dextinity/cms-admin` and the `scope` of the preview params in `@dextinity/site-nextjs` cannot use that declaration, as neither package depends on `@dextinity/cms-api`. Their values are typed as `string | number | null | undefined` instead.
