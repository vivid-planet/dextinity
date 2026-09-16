---
"@dextinity/cms-api": major
"@dextinity/brevo-api": major
"@dextinity/cms-admin": major
"@dextinity/site-nextjs": major
---

Type the module scope interfaces as `Partial<ContentScope>`

The scope interfaces accepted values of any type (`Record<string, any>`, `[key: string]: unknown`), which hid mistakes such as passing a scope class instead of a scope instance, or wrapping a scope in another object.
They now derive from the `ContentScope` interface an application declares once, so its dimensions are the single source of truth for the page tree, redirects, the DAM and Brevo:

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

`Partial` keeps scopes that use only some dimensions valid, for instance a DAM scoped by domain while pages are scoped by domain and language.

`ContentScope` in `@dextinity/cms-admin` and the `scope` of the preview params in `@dextinity/site-nextjs` cannot use that declaration, as neither package depends on `@dextinity/cms-api`. Their values are typed as `string | number | null | undefined` instead.
