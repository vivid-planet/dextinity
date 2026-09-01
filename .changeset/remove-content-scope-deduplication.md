---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": patch
---

Stop deduplicating content scopes in the user permissions API

`UserPermissionsService.getAvailableContentScopes()`, `getContentScopes()` and `getPermissionsAndContentScopes()` no longer deduplicate their content scopes. Deduplication only mattered for how the scopes are displayed, so it now happens in the admin where the lists are rendered. This also removes the `lodash.uniqwith` dependency.

Projects that consume `UserPermissionsPublicService` or the `currentUser` / `availableContentScopes` GraphQL fields directly and rely on the scopes being unique should deduplicate them on their side.
