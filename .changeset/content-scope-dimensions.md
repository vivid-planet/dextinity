---
"@comet/cms-api": minor
---

Allow declaring content scope dimensions at runtime

Content scope dimensions were previously only known implicitly from the keys of the `availableContentScopes` values. An optional dimension that is not part of `availableContentScopes` (e.g. a dimension with too many values to enumerate) therefore had no runtime representation.

Add an optional `availableContentScopeDimensions` option to the `UserPermissionsModule` to declare the content scope dimensions (with optional labels) at runtime, exposed via the `userPermissionsAvailableContentScopeDimensions` query. When omitted, the dimensions are derived from the keys of `availableContentScopes` as before.

A content scope for a dimension that is not part of `availableContentScopes` may hold any value (including the `"*"` wildcard). Because such dimensions can live outside `availableContentScopes`, the available content scopes no longer describe the full space of valid content scopes: content scopes assigned to a user are no longer validated or filtered against `availableContentScopes` (the `checkContentScopes` method has been removed). Access stays enforced by the per-request content scope check (`isAllowed`), which compares the requested scope against the user's granted scopes and does not depend on `availableContentScopes`.

**Example**

```ts
UserPermissionsModule.forRootAsync({
    useFactory: () => ({
        availableContentScopes: [ ... ],
        availableContentScopeDimensions: [{ name: "domain", label: "Domain (Website)" }, { name: "language" }, { name: "product" }],
        // ...
    }),
    // ...
});
```
