---
title: comet-crud
sidebar_position: 2
---

The `comet-crud` skill orchestrates all other skills to generate a complete full-stack CRUD entity — from the API layer through to the admin UI — in a single run. Each phase is validated (lint + tsc) and committed separately.

## What It Does

1. **API Entity & GraphQL** — generates the MikroORM entity, service, resolver, DTOs, and module registration (via `comet-api-graphql`)
2. **Translatable Enums** — generates translation components and form fields for any enums used by the entity (via `comet-admin-enum`)
3. **DataGrid & Form** — generates the list view and edit form in parallel (via `comet-admin-datagrid` + `comet-admin-form`)
4. **Admin Pages** — generates the page structure with navigation, toolbars, and routing (via `comet-admin-pages`)
5. **Master Menu** — adds the route entry to the application menu

## Examples

:::tip
Skills should trigger automatically based on your prompt. If a skill does not activate as expected, you can force it by prefixing your prompt with "Use the comet-crud skill" (or `/comet-crud`).
:::

### Minimal — let the skill decide

> Create CRUD for a `BlogPost` entity with title, content (rich text), author (string), and publishedAt (date).

The skill will infer sensible defaults: scoped entity, paginated grid with all fields as columns, a single-FieldSet form, and a standard grid + edit page layout.

### Detailed — scoped entity with enums, relations, and DAM image

> Create a `Product` entity scoped by domain + language.
>
> **Fields:** name (string, required), slug (string, unique per scope), description (optional, multiline),
> price (decimal, required, must be positive), isPublished (boolean, default false), mainImage (DAM image, optional).
>
> **Enum** productStatus: Draft, InReview, Published, Archived.
>
> **Relations:** ManyToMany to ProductCategory.
>
> **Validation:** Slug uniqueness validated server-side.
>
> **Grid:** Columns: mainImage thumbnail, name, productStatus as editable chip, price, isPublished.
> Search by name, filter by productStatus, Excel export.
>
> **Form:** FieldSets: "General" (name, slug, description, categories), "Details" (price, productStatus),
> "Media" (mainImage).
>
> **Pages:** Grid with edit on separate page. Entity toolbar showing product name.

### Non-paginated entity with position ordering

> Create a `ProductCategory` entity scoped by domain + language.
>
> **Fields:** name (string, required), slug (string, unique per scope), position (for manual ordering).
>
> **Relations:** ManyToOne to ProductCategory (optional parent for nesting).
>
> **Grid:** Non-paginated with drag-and-drop row reordering.
> Columns: name, slug, parentCategory name. No search or filters.
>
> **Form:** Single FieldSet: name, slug, parentCategory (AsyncSelectField).
>
> **Pages:** Grid with edit page. Entity toolbar showing category name.

### Sub-entity managed within a parent

> Create a `ProductVariant` entity as a sub-entity of Product (scoped via product relation).
>
> **Fields:** name (string, required), sku (string, required, unique within parent product),
> price (decimal, required, positive), stock (integer, required, default 0, non-negative),
> isAvailable (boolean, default true).
>
> **Enum** variantStatus: Active, OutOfStock, Discontinued.
>
> **Relations:** ManyToOne to Product (required parent).
>
> **Validation:** SKU uniqueness validated server-side within the parent product.
>
> **Grid:** Sub-entity grid filtered by parent product ID.
> Columns: name, sku, price, stock, variantStatus as editable chip, isAvailable.
> Search by name and sku.
>
> **Form:** FieldSets: "General" (name, sku, variantStatus select),
> "Pricing & Stock" (price, stock, isAvailable).
>
> **Pages:** Embedded as a "Variants" RouterTab in the Product edit page with nested StackSwitch.
> Entity toolbar showing variant name.

### Unscoped entity with edit dialog

> Create a `ProductReview` entity (not scoped, global).
>
> **Fields:** title (string, required), body (multiline, required), rating enum (One through Five),
> reviewerName (string, required), reviewedAt (datetime, required), isApproved (boolean, default false).
>
> **Relations:** ManyToOne to Product (required).
>
> **Grid:** Columns: title, rating, reviewerName, product name, reviewedAt, isApproved.
> Search by title and reviewerName, filter by product (relation filter) and isApproved, Excel export.
> Accepts optional `productId` prop for filtering on the Product detail page.
>
> **Form:** Edit via dialog overlay (no separate edit page).
> Dialog fields: product (AsyncAutocompleteField), title, body, rating (SelectField),
> reviewerName, reviewedAt, isApproved.
>
> **Pages:** Grid with dialog-based edit on the same page. Use `ContentScopeIndicator global`.
> Product edit page includes a "Reviews" RouterTab reusing the same grid with a productId filter.