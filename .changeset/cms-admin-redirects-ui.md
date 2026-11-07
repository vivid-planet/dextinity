---
"@dextinity/cms-admin": major
---

Build the redirects page of `createRedirectsPage` with `@dextinity/ui`

The redirects are listed in the `DataGrid` of `@dextinity/ui` with search, filters for status and origin (manual or automatic), an active switch per row, and bulk actions to activate, deactivate and delete. A click on a redirect edits it in a side panel next to the list (`ListDetailLayout`) instead of on a page of its own; the form uses `@dextinity/ui-react-final-form`, and the active switch of a new redirect is part of the form.

**Breaking:** The open redirect is kept in the URL as `?selected=<id>` (`?selected=new` for a new one) instead of `<path>/<id>/edit` and `<path>/add/add`. The former URLs are forwarded, so `basePath` of a redirect's `DependencyInterface` keeps working.

Saving an existing redirect keeps its origin. Before, it always became "manual".
