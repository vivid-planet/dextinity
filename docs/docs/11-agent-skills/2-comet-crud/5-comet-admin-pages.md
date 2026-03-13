---
title: comet-admin-pages
sidebar_position: 5
---

The `comet-admin-pages` skill generates the page structure, navigation, and layout for Comet admin CRUD views. It encodes best practices for Stack-based routing, toolbars, and page composition.

## What It Generates

- Page component with `Stack`, `StackSwitch`, and `StackPage` navigation
- `StackToolbar` with entity title and actions
- `StackMainContent` for page body layout
- `SaveBoundary` placement for form pages
- `RouterTabs` for multi-tab edit views
- `EditDialog` for lightweight inline editing

## Key Features

- Decision guide: simple page → grid + dialog → grid + page → edit with tabs → nested CRUD
- Entity Toolbar pattern with its own GraphQL query, loading/error states, and title display
- `StackLink` for navigation between list and detail views
- Breadcrumb-style navigation via Stack

## Examples

:::tip
Skills should trigger automatically based on your prompt. If a skill does not activate as expected, you can force it by prefixing your prompt with "Use the comet-admin-pages skill" (or `/comet-admin-pages`).
:::

### Minimal — let the skill decide the layout

> Create admin pages for `BlogPost`.

The skill generates a standard grid + edit page layout with StackSwitch and an entity toolbar.

### Grid with separate edit page and entity toolbar

> Create admin pages for `Product`.
>
> **Layout:** StackSwitch with grid page, add page, and edit page.
>
> **Grid toolbar:** "Add Product" button navigating to the add page.
>
> **Entity toolbar:** Shows the product name with the SKU as support text.
> Includes a delete button.

### Edit page with RouterTabs and nested sub-entity

> Create admin pages for `Product` with an edit page containing RouterTabs:
>
> - Tab "Product": the Product form
> - Tab "Variants": a ProductVariant sub-entity grid with its own nested StackSwitch
>   for add/edit variant pages
> - Tab "Reviews": a ProductReview grid filtered by the current product
>
> The variant edit page shows the variant name in the entity toolbar.

### Grid with dialog-based edit (no separate page)

> Create admin pages for `ProductReview`.
>
> **Layout:** Single page with the grid and an EditDialog on the same page.
> No StackSwitch needed. The dialog opens for both adding and editing.
>
> Use `ContentScopeIndicator global` since the entity is unscoped.

### Simple grid with edit page (non-paginated)

> Create admin pages for `ProductCategory`.
>
> **Layout:** StackSwitch with grid page and edit page.
>
> **Entity toolbar:** Shows the category name.