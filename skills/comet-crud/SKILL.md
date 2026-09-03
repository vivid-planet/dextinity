---
name: comet-crud
description: |
    Orchestrates full-stack CRUD entity generation for a Comet DXP project by composing existing skills in sequence:
    comet-api-graphql → comet-admin-enum → comet-admin-datagrid → comet-admin-form → comet-admin-pages → MasterMenu.
    Each step includes lint/tsc validation and a git commit.
    TRIGGER when: user says "create a new entity", "generate CRUD for X", "scaffold X", "full CRUD for X",
    or any phrase requesting end-to-end entity generation (API + admin UI) in a Comet DXP project.
    Also trigger when a crud sample command (crud-01 through crud-05) is invoked.
---

# Comet CRUD Orchestrator

Compose existing skills to generate a complete CRUD feature (API + Admin) for a Comet DXP entity.

## Project Layout & Validation Commands

Before Phase 0, determine once and reuse throughout:

1. **Locate the api and admin packages.** In a typical Comet starter they are `api/` and `admin/` at the repo root; in other setups they may live elsewhere (e.g. `demo/api` and `demo/admin` in the Comet monorepo). Find the packages containing the NestJS app and the admin React app.
2. **Detect the package manager** from the lockfile (`pnpm-lock.yaml` → pnpm, `package-lock.json` → npm, `yarn.lock` → yarn).
3. **Validation command** (referred to as _validate api_ / _validate admin_ below): run the package's `lint:fix` script (fixes ESLint **and** Prettier), then `lint:tsc`. Example with pnpm: `pnpm --dir <api-package> run lint:fix && pnpm --dir <api-package> run lint:tsc`. Use the equivalent invocation for the detected package manager. If a package has no `lint:fix` script, fall back to the individual `lint:*` scripts it does have.

## Workflow

### Phase 0 — Plan

Before generating anything, present a numbered plan to the user. The plan lists each phase below with a short summary of what will be generated. Wait for user confirmation or adjustments before proceeding.

**Plan template** (adapt to the entity — add/remove rows, adjust descriptions to match the concrete entity):

```
I'll generate full CRUD for <EntityName>:

| #   | Phase              | What will be generated                                                        | Skill                          |
|-----|--------------------|-------------------------------------------------------------------------------|--------------------------------|
| 1   | API Entity         | Entity, resolver, DTOs, paginated response, module, migration                 | comet-api-graphql              |
| 2   | Translatable Enums | Per enum: translatable component, chip, form field                            | comet-admin-enum  |
| 3+4 | DataGrid & Form    | Grid + form components (run in parallel via subagents)                         | comet-admin-datagrid + form    |
| 5   | Admin Page         | Page component wiring grid + form with Stack/StackSwitch navigation           | comet-admin-pages              |
| 6   | Master Menu        | Route entry in MasterMenu, import page component                              | —                              |

Each phase is validated (lint + tsc) and committed separately.

Proceed?
```

If the entity has no enums, omit the "Translatable Enums" row from the table.

### Phase 1 — API Entity & GraphQL Layer

Use the **comet-api-graphql** skill.

1. Generate entity, resolver, all DTOs, services where needed (position helpers, business-logic hooks), module registration, migration, and build API (all handled by the skill)
2. Validate api (see [Project Layout & Validation Commands](#project-layout--validation-commands))
3. Commit (see [Commit Strategy](#commit-strategy))

### Phase 2 — Translatable Enums

Skip this phase if the entity has no enum fields.

Use the **comet-admin-enum** skill.

For **every** enum in the entity:

1. Generate translatable base component
2. Generate chip component (for datagrid columns)
3. Generate form field component (SelectField by default; RadioGroupField if ≤4 options and user prefers)
4. Validate admin (see [Project Layout & Validation Commands](#project-layout--validation-commands))
5. Commit all enum components together

### Phase 3+4 — Admin DataGrid & Form (parallel generation, serial validation)

The two components touch disjoint files, so their **generation** can run in parallel; validation and commits happen afterwards in the main context to avoid concurrent lint/tsc runs racing on the same working tree.

Run these two generation steps **in parallel** using subagents. Subagents only write files — they must NOT run lint/tsc and must NOT commit:

**Subagent A — DataGrid** (comet-admin-datagrid skill): generate the grid component with columns, toolbar, filters.

**Subagent B — Form** (comet-admin-form skill): generate the form component with all fields grouped into FieldSets.

After both subagents complete, in the main context:

1. Validate admin once (see [Project Layout & Validation Commands](#project-layout--validation-commands)), fixing any errors across both components
2. Create two separate commits — DataGrid files first, then Form files (see [Commit Strategy](#commit-strategy))

### Phase 5 — Admin Page

Use the **comet-admin-pages** skill.

1. Generate page component wiring grid + form with appropriate navigation pattern.
2. Validate admin (see [Project Layout & Validation Commands](#project-layout--validation-commands))
3. Commit (see [Commit Strategy](#commit-strategy))

### Phase 6 — Master Menu

1. Add a route entry to `masterMenuData` — locate the master menu file in the admin package (typically `src/common/MasterMenu.tsx` in a Comet starter):
    - Import the page component
    - Add `type: "route"` entry with `<FormattedMessage>` label, icon, path, component, requiredPermission
    - Choose an appropriate icon from `@comet/admin-icons` (ask user if unsure)
    - Use kebab-case path (e.g., `/weather-stations`)
    - Use camelCase permission string (e.g., `weatherStations`)
2. Validate admin (see [Project Layout & Validation Commands](#project-layout--validation-commands))
3. Commit (see [Commit Strategy](#commit-strategy))

## Commit Strategy

After each phase, create a git commit:

1. Stage only the files created/modified in that phase (use `git add <file1> <file2> ...`)
2. Create commit with a descriptive message, e.g.:
    - `Add WeatherStation entity, resolver, and DTOs`
    - `Add translatable enum components for EpisodeType and ContentRating`
    - `Add WeatherStations DataGrid with toolbar`
    - `Add WeatherStation edit/create form`
    - `Add WeatherStationsPage with Stack navigation`
    - `Add WeatherStations to MasterMenu`

## Error Recovery

- If lint fails: fix the issues automatically, re-run lint, then commit
- If tsc fails: read the errors, fix the source files, re-run tsc, then commit
- If a skill produces unexpected output: read the generated files, compare against the skill's reference docs, and fix
