---
"@comet/cms-api": minor
---

Allow declaring content scope dimensions at runtime

Content scope dimensions were previously only known implicitly from the keys of the `availableContentScopes` values. An optional dimension that is not part of `availableContentScopes` (e.g. a dimension with too many values to enumerate) therefore had no runtime representation.

Add an optional `availableContentScopeDimensions` option to the `UserPermissionsModule` to declare the content scope dimensions (with optional labels) at runtime, exposed via the `userPermissionsAvailableContentScopeDimensions` query. When omitted, the dimensions are derived from the keys of `availableContentScopes` as before.

A content scope for a dimension that is not part of `availableContentScopes` may hold any value (including the `"*"` wildcard); the content scope check only validates the dimensions that are part of `availableContentScopes` and rejects unknown dimensions.

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
