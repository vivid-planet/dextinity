---
"@dextinity/site-react": patch
---

Reload changed persisted queries during development

`persistedQueryRoute` loaded the persisted queries file only once. Queries and fragments that changed while the dev server was running were ignored until a restart: a changed query failed with `PersistedQueryNotFound`, and a changed fragment silently sent the old fragment to the API.
Outside production, the route now reloads the file whenever it changes.
