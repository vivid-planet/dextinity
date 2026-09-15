---
"@dextinity/cms-admin": minor
---

Display only warnings of the currently selected scope by default

Previously, `WarningsPage` and `LatestWarningsDashboardWidget` displayed the warnings of all scopes the user is allowed to access.
Now, they only display the warnings of the currently selected scope by default.
Switching the scope automatically updates the displayed warnings.
Warnings without a scope (e.g., DAM warnings) and warnings with a partial scope (e.g., only `domain`) remain visible.
In `WarningsPage`, filtering the `scope` column is only possible with `showAllScopes`, because it otherwise queries a single scope.

Use the new `showAllScopes` prop to restore the previous behavior:

```tsx
<WarningsPage showAllScopes />
```

```tsx
<LatestWarningsDashboardWidget showAllScopes />
```
