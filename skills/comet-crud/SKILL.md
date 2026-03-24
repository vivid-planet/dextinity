---
name: comet-crud
description: |
    Orchestrates full-stack CRUD entity generation for a Comet DXP project by composing existing skills in sequence:
    comet-api-graphql → comet-admin-translatable-enum → comet-admin-datagrid → comet-admin-form → comet-admin-pages → MasterMenu.
    Each step includes lint/tsc validation and a git commit.
    TRIGGER when: user says "create a new entity", "generate CRUD for X", "scaffold X", "full CRUD for X",
    or any phrase requesting end-to-end entity generation (API + admin UI) in a Comet DXP project.
    Also trigger when a crud sample command (crud-01 through crud-05) is invoked.
---

# Comet CRUD Orchestrator

Compose existing skills to generate a complete CRUD feature (API + Admin) for a Comet DXP entity.

## Workflow

### Phase 0 — Plan

Before generating anything, present a numbered plan to the user. The plan lists each phase below with a short summary of what will be generated. Wait for user confirmation or adjustments before proceeding.

**Plan template** (adapt to the entity — add/remove rows, adjust descriptions to match the concrete entity):

```
I'll generate full CRUD for <EntityName>:

| #   | Phase              | What will be generated                                                        | Skill                          |
|-----|--------------------|-------------------------------------------------------------------------------|--------------------------------|
| 1   | API Entity         | Entity, service, resolver, DTOs, paginated response, module, migration        | comet-api-graphql              |
| 2   | Translatable Enums | Per enum: translatable component, chip, form field                            | comet-admin-translatable-enum  |
| 3+4 | DataGrid & Form    | Grid + form components (run in parallel via subagents)                         | comet-admin-datagrid + form    |
| 5   | Admin Page         | Page component wiring grid + form with Stack/StackSwitch navigation           | comet-admin-pages              |
| 6   | Master Menu        | Route entry in MasterMenu, import page component                              | —                              |

Each phase is validated (lint + tsc) and committed separately.

Proceed?
```

If the entity has no enums, omit the "Translatable Enums" row from the table.

### Phase 1 — API Entity & GraphQL Layer

Use the **comet-api-graphql** skill.

1. Generate entity, service, resolver, all DTOs, module registration, migration, and build API (all handled by the skill)
2. Validate: `npm --prefix api run lint:eslint -- --fix && npm --prefix api run lint:tsc`
3. Commit (see [Commit Strategy](#commit-strategy))

### Phase 2 — Translatable Enums

Skip this phase if the entity has no enum fields.

Use the **comet-admin-translatable-enum** skill.

For **every** enum in the entity:

1. Generate translatable base component
2. Generate chip component (for datagrid columns)
3. Generate form field component (SelectField by default; RadioGroupField if ≤4 options and user prefers)
4. Validate: `npm --prefix admin run lint:eslint -- --fix && npm --prefix admin run lint:tsc`
5. Commit all enum components together

### Phase 3+4 — Admin DataGrid & Form (parallel)

Run these two steps **in parallel** using subagents:

**Subagent A — DataGrid** (comet-admin-datagrid skill):

1. Generate grid component with columns, toolbar, filters
2. Validate: `npm --prefix admin run lint:eslint -- --fix && npm --prefix admin run lint:tsc`

**Subagent B — Form** (comet-admin-form skill):

1. Generate form component with all fields grouped into FieldSets
2. Validate: `npm --prefix admin run lint:eslint -- --fix && npm --prefix admin run lint:tsc`

After both subagents complete, apply their changes to the main branch and create two separate commits (DataGrid first, then Form) — see [Commit Strategy](#commit-strategy).

### Phase 5 — Admin Page

Use the **comet-admin-pages** skill.

1. Generate page component wiring grid + form with appropriate navigation pattern.
2. Validate: `npm --prefix admin run lint:eslint -- --fix && npm --prefix admin run lint:tsc`
3. Commit (see [Commit Strategy](#commit-strategy))

### Phase 6 — Master Menu

1. Add a route entry to `masterMenuData` in `admin/src/common/MasterMenu.tsx`:
    - Import the page component
    - Add `type: "route"` entry with `<FormattedMessage>` label, icon, path, component, requiredPermission
    - Choose an appropriate icon from `@comet/admin-icons` (ask user if unsure)
    - Use kebab-case path (e.g., `/weather-stations`)
    - Use camelCase permission string (e.g., `weatherStations`)
2. Validate: `npm --prefix admin run lint:eslint -- --fix && npm --prefix admin run lint:tsc`
3. Commit (see [Commit Strategy](#commit-strategy))

## Commit Strategy

After each phase, create a git commit using `--no-verify` for intermediate phases (1–5), because lint tools like knip may report false positives until all phases are complete and everything is wired together. Only the final phase (Phase 6) commit should run hooks normally (without `--no-verify`).

1. Stage only the files created/modified in that phase (use `git add <file1> <file2> ...`)
2. Create commit with a descriptive message, e.g.:
    - `Add WeatherStation entity, service, resolver, and DTOs`
    - `Add translatable enum components for EpisodeType and ContentRating`
    - `Add WeatherStations DataGrid with toolbar`
    - `Add WeatherStation edit/create form`
    - `Add WeatherStationsPage with Stack navigation`
    - `Add WeatherStations to MasterMenu`

If auto-commit is blocked (e.g., by permission restrictions or hook failures), generate a shell script the user can execute:

```bash
#!/bin/bash
git add path/to/file1 path/to/file2
git commit -m "Commit message here"
```

Then **wait for the user to confirm** they have run it before proceeding to the next phase.

## Error Recovery

- If lint fails: fix the issues automatically, re-run lint, then commit
- If tsc fails: read the errors, fix the source files, re-run tsc, then commit
- If a skill produces unexpected output: read the generated files, compare against the skill's reference docs, and fix
- If committing fails due to GPG signing issues: retry with `-c commit.gpgsign=false`
