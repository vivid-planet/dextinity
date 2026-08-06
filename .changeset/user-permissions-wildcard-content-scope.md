---
"@comet/cms-api": minor
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
