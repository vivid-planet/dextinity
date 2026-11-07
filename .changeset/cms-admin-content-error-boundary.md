---
"@dextinity/cms-admin": minor
---

Add `ContentErrorBoundary` and `RouteWithContentErrorBoundary`

They catch errors while rendering and show them as an empty state of `@dextinity/ui` with "Try again", and in development with the error's details, instead of the red banner of `RouteWithErrorBoundary`. `MasterMenuRoutes`, `BlockContentEditor`, and `BlockAdminTabs` use them. `RouteWithContentErrorBoundary` also clears the error when the location changes, so navigating away from a broken screen within the same route shows content again.

```tsx
<ContentErrorBoundary>
    <MyScreen />
</ContentErrorBoundary>
```
