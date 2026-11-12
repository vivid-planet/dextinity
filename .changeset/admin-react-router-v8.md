---
"@dextinity/admin": major
---

Upgrade React Router to v8

The admin packages require `react-router` v8 and React 19.2.7 or later. `react-router-dom` and `history` are no longer needed. Use the native React Router v8 APIs in your app (`<Routes>`, `<Route path="products/*" element={…} />`, `<Navigate replace />`, `useNavigate()`, relative routes); the Dextinity router components work inside them.

**Breaking changes**

- `RouterBrowserRouter` and `RouterMemoryRouter` are data routers that include the `RouterPromptHandler`. Their props are `RouterBrowserRouterProps` (`basename`) and `RouterMemoryRouterProps` (`initialEntries`, `initialIndex`, `basename`), and `getUserConfirmation` is removed. Don't render another React Router router inside or around them, and don't call `useBlocker` or `unstable_usePrompt` in your app
- `RouterPromptHandler` no longer accepts `apiRef` and only works inside a data router
- The `message` of `RouterPrompt` receives the `Location` and `NavigationType` of React Router instead of the types of `history`
- `ForcePromptRoute` takes `ForcePromptRouteProps` (`path` and children) instead of the v5 route props
- The children function of `SubRouteIndexRoute` receives `{ match }` with a React Router `PathMatch` instead of the v5 route props
- `RouteWithErrorBoundary` is no longer a route. Use it to wrap the element of a route: `<Route path="products/*" element={<RouteWithErrorBoundary><Products /></RouteWithErrorBoundary>} />`
- `StackLink`, `MainNavigationItemRouterLink` and the link slots of `StackBreadcrumbs`, `ToolbarBreadcrumbs` and `ToolbarBackButton` take the props of React Router v8's `Link`. `innerRef`, `component` and the function form of `to` are removed
- Navigations are asynchronous. Tests must wait for them and can't pass a `history` object anymore. Render them inside `RouterMemoryRouter` with `initialEntries`

**New features**

- Add `useCurrentRouteMatch()`, which returns the `url` and `pattern` of the current route and replaces v5's `useRouteMatch()` without arguments
- `RouterMemoryRouter` can be nested inside another router, for instance in a dialog. Its location, routes and prompts are isolated from the outer router
- `StackPage`, `RouterTabs`, `EditDialog` and the initial page of a `StackSwitch` provide a React Router route context, so relative links, relative routes and `useParams()` work inside them

**Behaviour changes**

- Closing a dirty `EditDialog` on the initial page of a `StackSwitch` asks to save the changes, like everywhere else
- Inside an `EditDialog` on the initial page of a `StackSwitch`, `RouterTabs` and the default `subRoutePath` of `FinalForm` and `SaveBoundary` build their URLs below the selection, e.g., `/products/index/7/variants` instead of `/products/index/variants`
- Navigating to the initial page of a `StackSwitch`, deselecting a `SelectionRoute` or selecting the default tab of `RouterTabs` at the root of the router goes to `/`. v5 stayed on the current URL
- In browser history, `useSubRoutePrefix()` and the `url` of `useCurrentRouteMatch()` are percent-encoded like React Router's route URLs, e.g., `/%C3%BCber/de` instead of v5's decoded `/über/de`
- Data Grids inside an `EditDialog` on the initial page of a `StackSwitch` lose their persisted column state once

See the [migration guide](https://cms-docs.dextinity.com/docs/migration-guide/migration-from-v10-to-v11) for all required changes.
