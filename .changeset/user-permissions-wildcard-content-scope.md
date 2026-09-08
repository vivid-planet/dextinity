---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Support wildcard values for content scope dimensions in `getContentScopesForUser`

`getContentScopesForUser` can now use the wildcard value `"*"` as the value of a content scope dimension to grant access to any value for that dimension. The wildcard is matched during the content scope check, so it does not need to be part of `availableContentScopes`.

**Example**

```ts
getContentScopesForUser(user: User): ContentScopesForUser {
    // Grant access to every language within the "main" domain
    return [{ domain: "main", language: "*" }];
}
```

For users with access to all content scopes, `currentUser.permissions[].contentScopes` now returns a single wildcard scope (e.g. `[{ domain: "*", language: "*" }]`) instead of the enumerated `availableContentScopes`. The default `isAllowed` and `currentUser.allowedContentScopes` handle the wildcard; a custom `isAllowed` must treat `"*"` as matching any value of a dimension.
