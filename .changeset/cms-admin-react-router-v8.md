---
"@dextinity/cms-admin": major
---

Update React Router to v8

`@dextinity/cms-admin` now requires `react-router` v8 as peer dependency instead of `react-router` v5 and `react-router-dom` v5.

**Breaking changes**

- The `route` of a `MasterMenu` item takes a path and an element instead of the React Router v5 `RouteProps`. The path matches all sub paths. Read path params with `useParams()`:

    ```diff
    route: {
        path: "/dashboard",
    -   component: DashboardPage,
    +   element: <DashboardPage />,
    },
    ```

- `useRoutePropsFromMasterMenuData()` returns `MasterMenuRoute[]` instead of `RouteProps[]`
- `MasterMenuRoutes` wraps each route in an `ErrorBoundary` instead of `RouteWithErrorBoundary`
- The `match` of `ContentScopeProvider`'s render prop and of `useContentScope()` is a `CurrentRouteMatch` (`url`, `path` and `params`) instead of the React Router v5 `match`. Its `path` no longer contains the allowed values of the scope dimensions (e.g. `/:domain/:language` instead of `/:domain(main|secondary)/:language(de|en)`), so it can be used with React Router v8
- `SitePreview` no longer accepts the React Router v5 `RouteComponentProps`
