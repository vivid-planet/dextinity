---
title: comet-api-graphql
sidebar_position: 1
---

The `comet-api-graphql` skill generates the NestJS/GraphQL API layer for a MikroORM entity. It follows the Comet convention of **thin resolvers** (GraphQL layer only) and **fat services** (all business logic).

## What It Generates

- **Entity** — MikroORM entity with decorators, validation, and relations
- **Service** — CRUD operations, pagination, filtering, sorting
- **Resolver** — thin GraphQL resolver delegating to the service
- **DTOs** — input, filter, sort, and args classes
- **Paginated Response** — `ObjectType` for paginated list queries
- **Module Registration** — adds the entity, service, and resolver to the NestJS module

## Key Features

- Pagination, filtering, and sorting via `@comet/cms-api` utilities
- Content scope support for multi-tenant setups
- Position ordering for sortable entities
- All relation types: `ManyToOne`, `OneToMany`, `ManyToMany`, `OneToOne`
- Slug-based queries with unique validation
- Permission decorators on all resolver methods

## Examples

:::tip
Skills should trigger automatically based on your prompt. If a skill does not activate as expected, you can force it by prefixing your prompt with "Use the comet-api-graphql skill" (or `/comet-api-graphql`).
:::

### Minimal — just fields

> Create the API for a `BlogPost` entity with title, content, author (string), and publishedAt (date).

The skill will create a scoped entity with a service, resolver, DTOs, and module registration using sensible defaults.

### Scoped entity with relations and slug validation

> Create the API for a `Product` entity scoped by domain + language.
>
> **Fields:** name (string, required), slug (string, required, unique per scope),
> description (string, optional), price (decimal, required), isPublished (boolean, default false),
> mainImage (DAM image, optional).
>
> **Enum** productStatus: Draft, InReview, Published, Archived.
>
> **Relations:** ManyToMany to ProductCategory (owner side).
>
> **Validation:** Slug uniqueness validated server-side — return field-level error `SLUG_ALREADY_EXISTS`.
> Price must be positive.

### Entity with position ordering and self-reference

> Create the API for a `ProductCategory` entity scoped by domain + language.
>
> **Fields:** name (string, required), slug (string, required, unique per scope),
> position (number, for manual ordering).
>
> **Relations:** ManyToOne to ProductCategory (optional parent for nesting).

### Sub-entity scoped via parent relation

> Create the API for a `ProductVariant` entity scoped via its parent Product relation
> (use `@ScopedEntity` deriving scope from the product).
>
> **Fields:** name (string, required), sku (string, required), price (decimal, required),
> stock (integer, required, default 0), isAvailable (boolean, default true).
>
> **Enum** variantStatus: Active, OutOfStock, Discontinued.
>
> **Relations:** ManyToOne to Product (required parent).
>
> **Validation:** SKU uniqueness within the parent product — return field-level error `SKU_ALREADY_EXISTS`.

### Unscoped entity with relation

> Create the API for a `ProductReview` entity (not scoped, global).
>
> **Fields:** title (string, required), body (string, required), rating enum (One through Five),
> reviewerName (string, required), reviewedAt (datetime, required), isApproved (boolean, default false).
>
> **Relations:** ManyToOne to Product (required).

### Add fields to an existing entity

> Add a `description` text field and a `ManyToOne` relation to `Department` on the `Employee` entity,
> and update the service, resolver, and DTOs.