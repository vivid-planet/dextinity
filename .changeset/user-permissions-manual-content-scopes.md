---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Keep manually assigned content scopes that are also granted by a rule

A content scope that was both manually assigned and granted by a rule could not be removed in the assigned-scopes grid and was silently dropped when another scope was added or removed. The admin derived the manual scopes by subtracting the rule-based scopes from the union, which loses a scope that is present in both.

The API now exposes both lists directly via the new query `userPermissionsAssignedContentScopes(userId)`, which returns `byRule` and `manual`. The assigned-scopes grid uses them instead of deriving the manual scopes. Such a scope is now shown as "Manual", stays removable, and is preserved when editing other scopes.

`userPermissionsContentScopes` is deprecated. Use `userPermissionsAssignedContentScopes` instead.
