---
name: comet-api-graphql
description: |
    Generates NestJS/GraphQL CRUD API files (resolver with inline CRUD logic, input/filter/sort/args DTOs, paginated response, conditional position/business-logic services) for a MikroORM entity in a Comet DXP project, matching the output style of @comet/api-generator. Resolvers inject EntityManager and contain the CRUD logic; services exist only for position helpers and business-logic hooks. Uses @comet/cms-api utilities for pagination, filtering, sorting, and permissions.
    TRIGGER when: any work involves NestJS, MikroORM, or GraphQL entities in the api/ package — creating, modifying, or generating resolvers, services, DTOs, inputs, filters, sorts, args, entities, or modules. Also trigger when the user or another skill/agent describes a new entity, asks to generate API boilerplate, or adds/removes fields from an existing entity.
---

# Comet GraphQL API Skill

Generate NestJS/GraphQL CRUD API files by analyzing a MikroORM entity (or entity description from the user) and producing resolver, DTO, and (when needed) service files following the patterns in `references/`.

## Input Sources

The skill accepts two starting points:

1. **Existing entity file** — Read the entity's MikroORM/GraphQL decorators (`@Property`, `@ManyToOne`, `@Enum`, `@RootBlock`, etc.) to derive all API files.
2. **User description** — The user describes what the entity looks like (fields, types, relations). If information is missing, **ask before generating**:
    - For relations: What type? (`ManyToOne`, `OneToMany`, `ManyToMany`, `OneToOne`)
    - For relations: Is the relation required or nullable?
    - For OneToMany: Is it `orphanRemoval: true` (nested input) or just ID references?
    - For the entity: Does it need position ordering? A slug field?
    - What permission string to use for `@RequiredPermission`?
    - Where should the files be written?

## Prerequisites

1. **Read the entity file** (if it exists) to extract: class name, all properties with their MikroORM/GraphQL decorators, and relation types.
2. **Determine if the entity is scoped** — Most entities in this project are scoped. If the entity file exists, read it to determine this from its decorators. If working from a user description and scope is not mentioned, **ask the user** before proceeding — do not assume no scope. See [feature-05-scope.md](references/feature-05-scope.md) for the available scope options and their implementation patterns.
3. **Identify the output directory** — ask the user or infer from project structure. DTOs go in a `dto/` subfolder.
4. **Check the NestJS module** file to understand existing providers and entity registrations.

## Generation Workflow

### Step 1 — Analyze the entity

Extract from the entity file or user description:

- Class name → derive name variants (see [gen-00-resolver.md](references/gen-00-resolver.md) for naming)
- All properties: type, MikroORM decorators (`@Property`, `@ManyToOne`, `@OneToMany`, `@ManyToMany`, `@OneToOne`, `@Enum`, `@RootBlock`), nullability
- Whether entity has: `position` field, `slug` field (unique), scope (see [feature-05-scope.md](references/feature-05-scope.md))
- Permission string for `@RequiredPermission`

### Step 2 — Determine API mode and which files to generate

**API mode** — Determine whether the entity needs full CRUD (read + write) or read-only access:

- **Full CRUD** (default) — generates queries AND mutations (create, update, delete)
- **Read-only** — generates only queries (findOne, findAll) and `@ResolveField` methods. No mutations, no input DTOs.

If the user says "read-only", "no mutations", "query only", or similar, use read-only mode. If unclear, ask.

| File                   | Full CRUD                                | Read-only | Condition                                                 |
| ---------------------- | ---------------------------------------- | --------- | --------------------------------------------------------- |
| Resolver               | Yes                                      | Yes       | Read-only: only queries + `@ResolveField`, no mutations   |
| Position service       | Only if `position` field                 | No        | Position helper methods only                              |
| Business-logic service | Only if validation/side effects          | No        | Hand-written hooks service                                |
| Input DTO              | Yes                                      | No        | —                                                         |
| Filter DTO             | Yes                                      | Yes       | —                                                         |
| Sort DTO               | Yes                                      | Yes       | —                                                         |
| Args DTO               | Yes                                      | Yes       | —                                                         |
| Paginated Response     | Yes                                      | Yes       | —                                                         |
| Scope Input DTO        | Depends on scope pattern                 | Same      | See [feature-05-scope.md](references/feature-05-scope.md) |
| Nested Input           | Per OneToMany with `orphanRemoval: true` | No        | Only when relation should be in input                     |

### Step 3 — Generate files

**Always read [gen-00-resolver.md](references/gen-00-resolver.md) first** — the resolver injects `EntityManager` and contains the full CRUD logic. Read [gen-07-service.md](references/gen-07-service.md) only when a service is needed (entity has a `position` field, or create/update needs business-logic validation). Then read the applicable files:

#### Generated File Types

| File Type                 | Reference                                                   | Description                                                |
| ------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| **Resolver** (CRUD)       | [gen-00-resolver.md](references/gen-00-resolver.md)         | Full CRUD inline: queries, mutations, @ResolveField        |
| **Service** (conditional) | [gen-07-service.md](references/gen-07-service.md)           | Only when needed: position helpers or business-logic hooks |
| **Input DTO**             | [gen-01-input.md](references/gen-01-input.md)               | Create + Update input types with validators                |
| **Filter DTO**            | [gen-02-filter.md](references/gen-02-filter.md)             | Filter input with and/or recursion                         |
| **Sort DTO**              | [gen-03-sort.md](references/gen-03-sort.md)                 | Sort field enum + sort input                               |
| **Args DTO**              | [gen-04-args.md](references/gen-04-args.md)                 | List query arguments (search, filter, sort, pagination)    |
| **Paginated Response**    | [gen-05-paginated.md](references/gen-05-paginated.md)       | Paginated wrapper type                                     |
| **Nested Input**          | [gen-06-nested-input.md](references/gen-06-nested-input.md) | Input for OneToMany with orphanRemoval                     |

#### Feature Overlays

Read these when the entity has the corresponding feature. Apply changes on top of the base patterns:

| Feature                    | Reference                                                             | When to apply                                                                   |
| -------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Position ordering**      | [feature-01-position.md](references/feature-01-position.md)           | Entity has `position: number` field                                             |
| **Validation**             | [feature-02-validation.md](references/feature-02-validation.md)       | Create/update operations need business logic validation                         |
| **Dedicated resolver arg** | [feature-03-dedicated-arg.md](references/feature-03-dedicated-arg.md) | A ManyToOne relation should be a top-level resolver arg instead of in the input |
| **Slug query**             | [feature-04-slug.md](references/feature-04-slug.md)                   | Entity has a `slug` string field with `unique: true`                            |
| **Scoped entity**          | [feature-05-scope.md](references/feature-05-scope.md)                 | Entity is scoped                                                                |

#### Field Type Patterns

Read the relevant field file when determining how to handle each property in input/filter/sort/resolver:

| Field Type                                  | Reference                                                         | When to use                                            |
| ------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| **Scalars** (string, number, boolean, date) | [field-01-scalar.md](references/field-01-scalar.md)               | Primitive `@Property` fields                           |
| **Enums**                                   | [field-02-enum.md](references/field-02-enum.md)                   | `@Enum()` fields (single or array)                     |
| **Relations**                               | [field-03-relation.md](references/field-03-relation.md)           | `@ManyToOne`, `@OneToMany`, `@ManyToMany`, `@OneToOne` |
| **Blocks**                                  | [field-04-block.md](references/field-04-block.md)                 | `@RootBlock()` CMS block fields                        |
| **JSON / Embedded**                         | [field-05-json-embedded.md](references/field-05-json-embedded.md) | JSON properties, `@Embedded()` objects                 |

### Step 4 — Register permission in AppPermission enum

The permission string used in `@RequiredPermission` must be registered in the `AppPermission` enum. Locate it in the api package's auth folder — in a typical starter it is `api/src/auth/app-permission.enum.ts`. Add a new entry to the `AppPermission` enum for the entity's permission. Use camelCase for the enum key and the camelCase permission string as the value.

Example — if the resolver uses `@RequiredPermission(["weatherStation"])`:

```typescript
export enum AppPermission {
    weatherStation = "weatherStation",
}
```

This enum is referenced by `UserPermissionsModule.forRootAsync()` in the api package's `app.module.ts` and controls which permissions are available in the admin UI.

### Step 5 — Register in NestJS module

Add the resolver (and any generated services) to the module's `providers` array. Ensure all referenced entities are in `MikroOrmModule.forFeature([...])`.

### Step 6 — Lint & schema refresh

First, locate the API package (typically `api/` in a starter project; it may differ — e.g. `demo/api` in the comet monorepo) and detect the package manager from the lockfile (`pnpm-lock.yaml` → pnpm, `package-lock.json` → npm, `yarn.lock` → yarn). Then, from the API package folder:

1. Run the project's `lint:fix` script (fixes ESLint + Prettier issues), e.g. `pnpm run lint:fix`.
2. Run `lint:tsc` to verify the API compiles without errors, e.g. `pnpm run lint:tsc`.
3. Verify the new entity's queries/mutations appear in the updated `schema.gql`.

### Step 7 — Create database migration

After creating or modifying an entity, a database migration must be created to apply the schema changes. From the API package folder (note the `--` before the subcommand when routing through the package manager's run script):

1. Run the `mikro-orm` script, e.g. `pnpm run mikro-orm -- migration:create`.
2. This produces a new migration file in the `src/db/migrations/` folder.
3. **Important: Clean up the migration file.** The generated migration often contains migration steps unrelated to the current change (e.g., from other pending schema differences). Review the file and **remove all statements that are not a direct result of the entity change you just made**. Only keep the SQL statements that correspond to the fields/relations you added, removed, or modified.
4. Run the `db:migrate` script, e.g. `pnpm run db:migrate`, to execute the migration.
5. **The migration MUST succeed.** If the migration fails, investigate the error and attempt to fix it (e.g., correct the SQL in the migration file, fix entity definitions, resolve constraint issues). If you cannot resolve the issue after reasonable attempts, ask the user for guidance — do not skip or ignore a failing migration.

## Relation Decision Rules

When encountering a relation on an entity, use this table to determine which pattern to apply. The key question is: **Does the related entity have its own CRUD API (independently queryable/editable)?** This must be determined from the user's description, existing code, or by asking the user.

| #   | Relation Type                           | Has Own CRUD?                                                      | Input DTO Shape                                                                                                                      | Create Mutation (in resolver)                                                                                                          | Update Mutation (in resolver)                                                    | ResolveField                        | Filter/Sort                                                                                             | Child Resolver                                                       |
| --- | --------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| R1  | **ManyToOne** (standard)                | n/a — target is independent                                        | `string` (UUID), `@Field(() => ID)`, `@IsUUID()`. Nullable: `@IsOptional()`, `nullable: true`                                        | `Reference.create(await em.findOneOrFail(Target, id))`                                                                                 | `if (input !== undefined)` guard, then same. Nullable can unlink via `undefined` | `.loadOrFail()` or `?.loadOrFail()` | `ManyToOneFilter`, sortable                                                                             | n/a                                                                  |
| R2  | **ManyToOne** as dedicated arg          | **Yes** — child has own CRUD, this ManyToOne points back to parent | **Excluded from input**. Becomes top-level `@Args("parent", { type: () => ID })` on child create. Required field in child list args. | `Reference.create(await em.findOneOrFail(Parent, parentArg))`                                                                          | Parent FK not editable                                                           | `child.parent.loadOrFail()`         | Required in args (`where.parent = id`). Excluded from filter/sort. `@AffectedEntity(Parent, { idArg })` | Full CRUD (see [feature-03](references/feature-03-dedicated-arg.md)) |
| R3  | **ManyToMany** (simple, no join entity) | n/a — ORM manages join table                                       | `string[]` (UUID array), `@Field(() => [ID], { defaultValue: [] })`, `@IsArray()`, `@IsUUID(each)`                                   | Find by IDs → validate count → `collection.loadItems()` → `collection.set(_.map(Reference.create))`                                    | Same as create                                                                   | `.loadItems()`                      | `ManyToManyFilter`. Not sortable                                                                        | n/a                                                                  |
| R4  | **ManyToMany** with join entity         | **No** — join entity has no CRUD                                   | `ParentNestedJoinEntityInput[]` — other-side FK as UUID `string` + extra scalar fields                                               | Destructure FK → `findOneOrFail` → `em.assign(new JoinEntity(), { ...scalars, otherSide: Reference.create() })` via `collection.set()` | Same (full replacement, orphan removal)                                          | `.loadItems()`                      | Not in filter/sort                                                                                      | Minimal: only `@ResolveField` for both FKs                           |
| R5  | **OneToMany** nested                    | **No** — child only exists as part of parent                       | `ParentNestedChildInput[]` — only scalar fields, no parent FK, no ID (see [gen-06](references/gen-06-nested-input.md))               | `collection.loadItems()` → `collection.set(inputs.map(i => em.assign(new Child(), { ...i })))`                                         | Same (full replacement, orphan removal)                                          | `.loadItems()`                      | Not in filter/sort                                                                                      | Minimal: only `@ResolveField` for back-reference                     |
| R6  | **OneToMany** separate CRUD             | **Yes** — child is independently queryable/editable                | **Excluded from parent input** entirely. Parent only gets `@ResolveField`                                                            | n/a on parent side                                                                                                                     | n/a on parent side                                                               | Parent: `.loadItems()`              | n/a on parent side                                                                                      | Full CRUD. Child's ManyToOne to parent uses R2                       |
| R7  | **OneToOne** nested                     | **No** — related entity only exists with parent                    | Nested object with scalar fields, no FK, no ID. Nullable: `@IsOptional()`                                                            | `new Child()` + `em.assign(child, { ...input })`                                                                                       | `parent.rel ? await parent.rel.loadOrFail() : new Child()`                       | `?.loadOrFail()`                    | Not in filter/sort                                                                                      | None needed                                                          |

### How to decide "Has Own CRUD" vs "Nested"

| Signal                            | Own CRUD (R2/R6)                   | Nested (R4/R5/R7)                      |
| --------------------------------- | ---------------------------------- | -------------------------------------- |
| Independently queryable?          | Yes — has own list page, own forms | No — only meaningful as part of parent |
| Has `position` grouped by parent? | Often yes                          | Rarely                                 |
| Uses `orphanRemoval: true`?       | No                                 | Yes                                    |
| Fully replaced on parent save?    | No                                 | Yes                                    |

When the user describes a relation and it's unclear whether the child should be managed independently or inline with the parent, **always ask the user** before proceeding.

## Key Rules

### Architecture: Resolver-based CRUD, Conditional Services

- **Resolvers ARE the CRUD layer** — they inject `EntityManager` directly and contain the create/update/delete logic inline (`entityManager.create`, `Reference.create`, `collection.set()`, nested input handling), matching what `@comet/api-generator` emits.
- **Generate a service ONLY when needed** — there are two kinds (see [gen-07-service.md](references/gen-07-service.md)):
    - a **position helpers service** (`{entity-names}.service.ts`, plural) when the entity has a `position` field — contains only `incrementPositions`/`decrementPositions`/`getLastPosition`;
    - a hand-written **business-logic (hooks) service** (`{entity-name}.service.ts`, singular) when create/update needs validation or side effects — implements `CrudGeneratorHooksService` from `@comet/cms-api`.
- **Plain scalar entities get no service at all** — never generate a pass-through service.
- **EVERY relation and block MUST have a `@ResolveField`** — no exceptions. Every `@ManyToOne`, `@OneToMany`, `@ManyToMany`, and `@RootBlock` on the entity requires a corresponding `@ResolveField` method in the resolver. Never eagerly load relations via `.init()` or hardcoded `populate` in queries — rely solely on `@ResolveField` lazy loading.
- **`@ResolveField` for relations**: `entity.relation.loadOrFail()` (ManyToOne) or `entity.relation.loadItems()` (ManyToMany/OneToMany).
- **`@ResolveField` for blocks**: `this.blocksTransformer.transformToPlain(entity.blockField)` — `BlocksTransformerService` is injected in the resolver constructor.
- **Resolver constructor** injects `EntityManager`, plus `BlocksTransformerService` (for blocks), the position helpers service (for position), and the business-logic service (for hooks) as applicable.

### DTOs and Input

- **Import `PartialType` from `@comet/cms-api`**, NOT from `@nestjs/graphql`.
- **Destructure** relation and block fields from input before spreading in the **resolver's mutations**: `const { relation: relationInput, ...assignInput } = input`.
- **Always add `and`/`or` fields** to filter DTOs for recursive filtering.
- **Default sort**: `position ASC` if entity has position, otherwise `createdAt ASC`.
- **UpdateInput**: Always `extends PartialType(EntityInput)` — nothing else needed.
- **Nullable ManyToOne in update**: Check `if (relationInput !== undefined)` in the update mutation to distinguish "not provided" from "set to null".
- `requiredPermission` as string: `@RequiredPermission("x", ...)`. As array: `@RequiredPermission(["x"], ...)`.
