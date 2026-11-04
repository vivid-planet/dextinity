---
description: File, folder, DB, and branch naming conventions across api/admin/site
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.sql"
paths:
    - "**/*.{ts,tsx,js,jsx}"
    - "**/*.sql"
globs:
    - "**/*.{ts,tsx,js,jsx}"
    - "**/*.sql"
alwaysApply: false
---

# Naming Conventions

## Files and folders

| Layer                 | Folder case                        | File case                                                                                                                                     |
| --------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **API** (NestJS)      | `kebab-case` (e.g. `page-tree/`)   | `kebab-case` with dot segments (e.g. `page-tree.service.ts`, `page-tree.module.ts`)                                                           |
| **Admin** (React/MUI) | `camelCase` (e.g. `pageTree/`)     | `PascalCase.tsx` for components (`DashboardPage.tsx`); `camelCase.ts` for hooks/utils (`useUser.ts`)                                          |
| **Site** (Next.js)    | `camelCase` (e.g. `contentScope/`) | `PascalCase.tsx` for components; `camelCase.ts` for hooks/utils; **exception**: Next.js route files stay lowercase (`page.tsx`, `layout.tsx`) |

## Database / infra

- Database name: `db_<project>_<env>` (e.g. `db_myproject_dev`).
- DB user: `<project>_<env>` (e.g. `myproject_dev`).
- Entity names: singular, PascalCase (e.g. `Product`, not `Products` or `product`).
- Kubernetes namespaces / releases: `<project>-<env>` (e.g. `myproject-prod`).

## Git

- Standard long-lived branches: `main`, `staging`, optionally `test`.
- Feature branches: must start with `feature/` to receive GitLab branch protection.

## Consistency with other rules

- TypeScript-specific naming (enums, types) → [typescript.instructions.md](typescript.instructions.md).
- React component/prop/state naming → [react.instructions.md](react.instructions.md).
- Boolean, affirmative, no-abbreviation rules → [general.instructions.md](general.instructions.md).
