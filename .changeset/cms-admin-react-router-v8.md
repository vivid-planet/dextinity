---
"@dextinity/cms-admin": major
---

Upgrade React Router to v8

`@dextinity/cms-admin` requires `react-router` v8 and React 19.2.7 or later. `react-router-dom` is no longer needed.

**Breaking changes**

- The children of `ContentScopeProvider` are rendered as the element of a route at the URL of the content scope. Routes inside them must be relative, e.g., `<Route path="preview/*" element={…} />`
- `useContentScope().match` and the argument of the children function of `ContentScopeProvider` are a `ContentScopeMatch` (`params`, `url`, `isExact`) instead of v5's `match`. `match.path` is removed, and `match.url` is percent-encoded in browser history
- `createPath` of a custom `ContentScopeProvider` `location` returns structured paths instead of path patterns with regular expressions:

    ```ts
    const location: ContentScopeLocation = {
        createPath: () => [{ dimension: "language", values: ["de", "en"] }],
        createUrl: (scope) => `/${scope.language}`,
    };
    ```

- The `route` of a `MasterMenuData` item is a `MasterMenuRoute` (`{ path, element }`) instead of v5's `RouteProps`. Replace `component` and `render` with `element`: `route: { path: "/dashboard", element: <DashboardPage /> }`
- `MasterMenuRoutes` renders a `<Routes>` and ranks the menu routes by specificity instead of rendering the first match
- `SitePreview` no longer accepts the route props. Render it as an element: `<Route path="preview/*" element={<SitePreview resolvePath={…} />} />`

**New features**

- Export the `ContentScopeLocation`, `ContentScopeMatch`, `ContentScopePath` and `MasterMenuRoute` types

**Fixes**

- Support content scopes with `null` values with the default content scope location. Their URLs (e.g., `/main/-`) never matched before, which left the admin blank

Data Grids rendered directly in a master menu route or inside `BlockAdminTabs` lose their persisted column state once.

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for all required changes.
