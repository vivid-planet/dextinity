---
"@dextinity/admin": major
---

Update React Router to v8

React Router v5 is no longer maintained. `@dextinity/admin` now requires `react-router` v8 as peer dependency instead of `react-router` v5, `react-router-dom` v5 and `history`. React Router v8 requires React 19.2.7 or later.

`RouterBrowserRouter` and `RouterMemoryRouter` now create a data router, which React Router requires for blocking navigations. Render your routes as children as before. They only accept `basename` (and `initialEntries`/`initialIndex` for `RouterMemoryRouter`) anymore. `RouterMemoryRouter` can be nested in another router, for instance in a dialog.

The router components of `@dextinity/admin` (`StackSwitch`, `RouterTabs`, `SubRoute`, `SelectionRoute`, `RouterPrompt`) keep their behavior. Components rendered inside them can use relative `<Routes>`, `useParams()` and relative links.

**New APIs**

- `useCurrentRouteMatch()` returns `url`, `path` and `params` of the closest route, like `useRouteMatch()` in React Router v5
- `<AbsoluteRoute path exact>` renders its children if an absolute path matches the location, like `<Route>` in React Router v5. Use it for paths built with `useSubRoutePrefix()`
- `<AbsoluteRoutes>` renders the first matching `<AbsoluteRoute>` or `<SubRouteIndexRoute>`, like `<Switch>` in React Router v5

**Breaking changes**

- Remove `RouteWithErrorBoundary`. Wrap the element of a route in an `ErrorBoundary` instead: `<Route path="products/*" element={<ErrorBoundary key="products"><ProductsPage /></ErrorBoundary>} />`
- `ForcePromptRoute` accepts `path`, `exact` and `children` instead of the React Router v5 `RouteProps`
- `SubRouteIndexRoute` only accepts `ReactNode` or a function receiving the match as children. Use it in `<AbsoluteRoutes>` instead of `<Switch>`
- `RouterPromptHandler` no longer accepts `apiRef`
- The `message` callback of `RouterPrompt` receives `Location` and `NavigationType` from `react-router` instead of the `history` types
- The `link` slot of `StackBreadcrumbs` uses the `Link` of React Router v8, which doesn't support `innerRef`. Use `ref` instead

See the migration guide for how to migrate your routes.
