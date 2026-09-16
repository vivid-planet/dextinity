---
"@dextinity/cms-api": major
"@dextinity/brevo-api": major
"@dextinity/cms-admin": major
"@dextinity/site-nextjs": major
---

Restrict content scope dimensions to strings and numbers

The scope interfaces accepted values of any type (`Record<string, any>`, `[key: string]: unknown`), which hid mistakes such as passing a scope class instead of a scope instance, or wrapping a scope in another object.
An application now declares its dimensions in `ContentScopeDimensions`, and every scope type derives from it:

```ts
// Before
declare module "@dextinity/cms-api" {
    interface ContentScope extends BaseContentScope {}
}

// After
declare module "@dextinity/cms-api" {
    interface ContentScopeDimensions extends BaseContentScope {}
}
```

`ContentScope` maps each declared dimension to itself when it is a `string`, a `number`, `null` or `undefined`, and to a message type otherwise, so a scope carrying an unsupported dimension no longer fits where a content scope is expected:

```
Type '{ id: string; }' is not assignable to type 'A content scope dimension must be a string, a number, null or undefined'
```

The module scope interfaces are `ModuleContentScope`, in which every dimension is optional, so a module may use a subset of them — for instance a DAM scoped by domain while pages are scoped by domain and language:

- `ScopeInterface` (page tree), `RedirectScopeInterface` and `DamScopeInterface` in `@dextinity/cms-api`
- `EmailCampaignScopeInterface` in `@dextinity/brevo-api`

Scope classes need no index signature, as the dimensions are named properties.

`ContentScope` in `@dextinity/cms-admin` and the `scope` of the preview params in `@dextinity/site-nextjs` cannot use that declaration, as neither package depends on `@dextinity/cms-api`. Their values are typed as `string | number | null | undefined` instead.
