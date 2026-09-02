---
"@dextinity/cms-api": major
"@dextinity/brevo-api": major
"@dextinity/cms-admin": major
"@dextinity/site-nextjs": major
---

Restrict content scope values to `string | number | null | undefined`

The content scope interfaces accepted values of any type (`Record<string, any>`, `[key: string]: unknown`), which hid mistakes such as passing a scope class instead of a scope instance, or wrapping a scope in another object.
Scope dimensions are now typed as `string | number | null | undefined`:

- `ScopeInterface` (page tree), `RedirectScopeInterface` and `DamScopeInterface` in `@dextinity/cms-api`
- `EmailCampaignScopeInterface` in `@dextinity/brevo-api`
- `ContentScope` in `@dextinity/cms-admin`
- `scope` in the preview params returned by `previewParams()`, `legacyPagesRouterPreviewParams()` and `setSitePreviewParams()` in `@dextinity/site-nextjs`

**Migration**

TypeScript only gives classes an index signature when it is declared explicitly, so scope classes in your application need one.
It can be narrower than the interface, so a scope with only string dimensions declares `[key: string]: string`:

```ts
@Embeddable()
@ObjectType("PageTreeNodeScope")
@InputType("PageTreeNodeScopeInput")
export class PageTreeNodeScope {
    [key: string]: string;

    @Property({ columnType: "text" })
    @Field()
    @IsString()
    domain: string;

    @Property({ columnType: "text" })
    @Field()
    @IsString()
    language: string;
}
```
