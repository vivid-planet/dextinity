---
"@dextinity/agent-features": minor
---

Add skills for generating CRUD features

`dextinity-crud` generates the API and admin UI for an entity from a short description. It shows a plan first, then uses the other new skills, which also work on their own:

- `dextinity-api-graphql`: GraphQL resolver, DTOs and permission for a MikroORM entity, in the style of `api-generator`
- `dextinity-admin-enum`: translated labels, chips and form fields for GraphQL enums
- `dextinity-admin-datagrid`: server-side DataGrid with filtering, sorting, search and pagination
- `dextinity-admin-form`: Final Form edit form with create and edit modes and save conflict detection
- `dextinity-admin-pages`: page navigation with `Stack`, `StackSwitch`, `RouterTabs` and `EditDialog`
