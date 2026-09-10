---
"@dextinity/cms-api": minor
"@dextinity/cms-admin": minor
---

Keep manually assigned content scopes that are also granted by a rule

A content scope that was both manually assigned and granted by a rule could not be removed in the assigned-scopes grid and was silently dropped when another scope was added or removed. The admin derived the manual scopes by subtracting the rule-based scopes from the union, which loses a scope that is present in both.

The API now exposes the persisted manual scopes directly via `userPermissionsManualContentScopes(userId)`, and the assigned-scopes grid uses it as the source of truth for the manual assignments instead of deriving them. Such a scope is now shown as "Manual", stays removable, and is preserved when editing other scopes.
