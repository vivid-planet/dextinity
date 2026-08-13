---
"@dextinity/cms-api": minor
---

Allow declaring content scope dimensions at runtime

Add an optional `availableContentScopeDimensions` option to the `UserPermissionsModule` to declare the content scope dimensions (with optional labels). When omitted, the dimensions are derived from the keys of `availableContentScopes`.

A content scope may hold any value (including the `"*"` wildcard) for a dimension that is not part of `availableContentScopes`. Content scopes are no longer validated against `availableContentScopes`; access is enforced per request by `isAllowed`, which compares the requested scope against the user's granted scopes.

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
