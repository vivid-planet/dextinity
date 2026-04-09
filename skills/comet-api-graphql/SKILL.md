---
name: comet-api-graphql
description: |
    Generates NestJS/GraphQL CRUD API files (service, thin resolver, input/filter/sort/args DTOs, paginated response) for a MikroORM entity in a Comet DXP project. Services contain all business logic; resolvers are thin GraphQL layers. Uses @comet/cms-api utilities for pagination, filtering, sorting, and permissions.
    TRIGGER when: any work involves NestJS, MikroORM, or GraphQL entities in the api/ package — creating, modifying, or generating resolvers, services, DTOs, inputs, filters, sorts, args, entities, or modules. Also trigger when the user or another skill/agent describes a new entity, asks to generate API boilerplate, or adds/removes fields from an existing entity.
---

# Comet GraphQL API Skill

Generate NestJS/GraphQL CRUD API files by analyzing a MikroORM entity (or entity description from the user) and producing service, resolver, and DTO files following the patterns in `references/`.

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

| File               | Full CRUD                                | Read-only | Condition                                                 |
| ------------------ | ---------------------------------------- | --------- | --------------------------------------------------------- |
| Service            | Yes                                      | Yes       | Read-only: only `findOneById`, `findAll` methods          |
| Resolver           | Yes                                      | Yes       | Read-only: only queries + `@ResolveField`, no mutations   |
| Input DTO          | Yes                                      | No        | —                                                         |
| Filter DTO         | Yes                                      | Yes       | —                                                         |
| Sort DTO           | Yes                                      | Yes       | —                                                         |
| Args DTO           | Yes                                      | Yes       | —                                                         |
| Paginated Response | Yes                                      | Yes       | —                                                         |
| Scope Input DTO    | Depends on scope pattern                 | Same      | See [feature-05-scope.md](references/feature-05-scope.md) |
| Nested Input       | Per OneToMany with `orphanRemoval: true` | No        | Only when relation should be in input                     |

### Step 3 — Generate files

**Always read [gen-07-service.md](references/gen-07-service.md) and [gen-00-resolver.md](references/gen-00-resolver.md) first** — the service contains all business logic, the resolver is a thin GraphQL layer. Then read the applicable files:

#### Generated File Types

| File Type              | Reference                                                   | Description                                             |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| **Service** (base)     | [gen-07-service.md](references/gen-07-service.md)           | All business logic: CRUD, relations, blocks, position   |
| **Resolver** (thin)    | [gen-00-resolver.md](references/gen-00-resolver.md)         | Thin GraphQL layer: queries, mutations, @ResolveField   |
| **Input DTO**          | [gen-01-input.md](references/gen-01-input.md)               | Create + Update input types with validators             |
| **Filter DTO**         | [gen-02-filter.md](references/gen-02-filter.md)             | Filter input with and/or recursion                      |
| **Sort DTO**           | [gen-03-sort.md](references/gen-03-sort.md)                 | Sort field enum + sort input                            |
| **Args DTO**           | [gen-04-args.md](references/gen-04-args.md)                 | List query arguments (search, filter, sort, pagination) |
| **Paginated Response** | [gen-05-paginated.md](references/gen-05-paginated.md)       | Paginated wrapper type                                  |
| **Nested Input**       | [gen-06-nested-input.md](references/gen-06-nested-input.md) | Input for OneToMany with orphanRemoval                  |

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

Read the relevant field file when determining how to handle each property in input/filter/sort/service:

| Field Type                                  | Reference                                                         | When to use                                            |
| ------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| **Scalars** (string, number, boolean, date) | [field-01-scalar.md](references/field-01-scalar.md)               | Primitive `@Property` fields                           |
| **Enums**                                   | [field-02-enum.md](references/field-02-enum.md)                   | `@Enum()` fields (single or array)                     |
| **Relations**                               | [field-03-relation.md](references/field-03-relation.md)           | `@ManyToOne`, `@OneToMany`, `@ManyToMany`, `@OneToOne` |
| **Blocks**                                  | [field-04-block.md](references/field-04-block.md)                 | `@RootBlock()` CMS block fields                        |
| **JSON / Embedded**                         | [field-05-json-embedded.md](references/field-05-json-embedded.md) | JSON properties, `@Embedded()` objects                 |

### Step 4 — Register permission in AppPermission enum

The permission string used in `@RequiredPermission` must be registered in `api/src/auth/app-permission.enum.ts`. Add a new entry to the `AppPermission` enum for the entity's permission. Use camelCase for the enum key and the camelCase permission string as the value.

Example — if the resolver uses `@RequiredPermission(["weatherStation"])`:

```typescript
export enum AppPermission {
    weatherStation = "weatherStation",
}
```

This enum is referenced by `UserPermissionsModule.forRootAsync()` in `api/src/app.module.ts` and controls which permissions are available in the admin UI.

### Step 5 — Register in NestJS module

Add the service and resolver to the module's `providers` array. Ensure all referenced entities are in `MikroOrmModule.forFeature([...])`.

### Step 6 — Lint & schema refresh

1. Run `npm --prefix api run lint:eslint -- --fix` from the project root.
2. Run `npm --prefix api run lint:tsc` to verify the API compiles without errors.
3. Verify the new entity's queries/mutations appear in the updated `schema.gql`.

### Step 7 — Create database migration

After creating or modifying an entity, a database migration must be created to apply the schema changes:

1. Run `npm --prefix api run mikro-orm migration:create` from the project root.
2. This produces a new migration file in the `src/db/migrations/` folder.
3. **Important: Clean up the migration file.** The generated migration often contains migration steps unrelated to the current change (e.g., from other pending schema differences). Review the file and **remove all statements that are not a direct result of the entity change you just made**. Only keep the SQL statements that correspond to the fields/relations you added, removed, or modified.
4. Run `npm --prefix api run db:migrate` to execute the migration.
5. **The migration MUST succeed.** If the migration fails, investigate the error and attempt to fix it (e.g., correct the SQL in the migration file, fix entity definitions, resolve constraint issues). If you cannot resolve the issue after reasonable attempts, ask the user for guidance — do not skip or ignore a failing migration.

## Relation Decision Rules

When encountering a relation on an entity, use this table to determine which pattern to apply. The key question is: **Does the related entity have its own CRUD API (independently queryable/editable)?** This must be determined from the user's description, existing code, or by asking the user.

| #   | Relation Type                           | Has Own CRUD?                                                      | Input DTO Shape                                                                                                                      | Service Create                                                                                                                         | Service Update                                                                   | ResolveField                        | Filter/Sort                                                                                             | Child Resolver                                                       |
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

### Architecture: Thin Resolvers, Service-based Business Logic

- **Always generate a service** (`{entity-names}.service.ts`) — it is the single source of business logic.
- **Resolvers MUST be thin** — they handle GraphQL concerns (decorators, argument parsing, `@ResolveField`) and delegate all CRUD operations to the service.
- **Resolvers MUST NOT inject `EntityManager`** — only inject the service. `EntityManager` belongs exclusively in services for testability: services can be unit-tested with a mocked `EntityManager`, while resolvers stay free of data-access concerns.
- **EVERY relation and block MUST have a `@ResolveField`** — no exceptions. Every `@ManyToOne`, `@OneToMany`, `@ManyToMany`, and `@RootBlock` on the entity requires a corresponding `@ResolveField` method in the resolver. Never eagerly load relations via `.init()` or hardcoded `populate` in queries — use `@ResolveField` with lazy loading instead.
- **`@ResolveField` for relations** stays in the resolver: `entity.relation.loadOrFail()` (ManyToOne) or `entity.relation.loadItems()` (ManyToMany/OneToMany).
- **`@ResolveField` for blocks** delegates to the service (`this.service.transformToPlain(entity.blockField)`).
- **Service constructor** injects `EntityManager` and optionally `BlocksTransformerService` (for blocks).

### DTOs and Input

- **Import `PartialType` from `@comet/cms-api`**, NOT from `@nestjs/graphql`.
- **Destructure** relation and block fields from input before spreading in the **service**: `const { relation: relationInput, ...assignInput } = input`.
- **Always add `and`/`or` fields** to filter DTOs for recursive filtering.
- **Default sort**: `position ASC` if entity has position, otherwise `createdAt ASC`.
- **Populate array**: Only populate relations that have a `@ResolveField`. The resolver extracts GraphQL fields via `extractGraphqlFields` and passes them to the service's `findAll` method.
- **UpdateInput**: Always `extends PartialType(EntityInput)` — nothing else needed.
- **Nullable ManyToOne in update**: Check `if (relationInput !== undefined)` in the **service** to distinguish "not provided" from "set to null".
- When entity has no relations with `@ResolveField`, omit `@Info()`, `extractGraphqlFields`, and `fields` parameter from resolver and service.
- `requiredPermission` as string: `@RequiredPermission("x", ...)`. As array: `@RequiredPermission(["x"], ...)`.
