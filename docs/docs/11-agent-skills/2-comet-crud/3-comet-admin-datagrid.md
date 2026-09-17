---
title: comet-admin-datagrid
sidebar_position: 3
---

The `comet-admin-datagrid` skill generates server-side MUI DataGrid components for the Comet admin. All filtering, sorting, searching, and pagination are handled server-side using Apollo Client.

## What It Generates

- DataGrid component with typed columns
- Server-side pagination, sorting, and filtering via `useDataGridRemote` and `usePaginationQuery`
- Toolbar with search, filter button, and actions (add, delete)
- Filter bar components for each filterable field

## Key Features

- Column types: string, boolean, number, date/time, enum (with chips), relations, file uploads
- Multiple variants: standard paginated, non-paginated, row reordering, sub-entity grids
- Selection/checkbox mode for bulk actions
- Excel export support
- Responsive column visibility

## Examples

:::tip
Skills should trigger automatically based on your prompt. If a skill does not activate as expected, you can force it by prefixing your prompt with "Use the comet-admin-datagrid skill" (or `/comet-admin-datagrid`).
:::

### Minimal — no column or filter details

> Create a datagrid for `BlogPost`.

The skill reads the entity's GraphQL schema and generates columns, search, and filters based on the available fields.

### Paginated grid with editable chips, filters, and Excel export

> Create a datagrid for `Product`.
>
> **Columns:** mainImage (thumbnail, excluded from Excel export), name, sku, productType as editable chip,
> categories (comma-separated names), price, productStatus as editable chip, publishedAt, isPublished.
>
> **Search:** by name and sku.
>
> **Filters:** productStatus, productType.
>
> **Features:** Excel export enabled.

### Partial specification — only columns, no filters

> Create a datagrid for `Employee` with columns: name, email, department (relation), hiredAt.

The skill generates the grid with the specified columns. Since no filters or search are mentioned, it will ask or infer reasonable defaults.

### Non-paginated grid with row reordering

> Create a datagrid for `ProductCategory`.
>
> **Columns:** name, slug, parentCategory (show parent name).
>
> **Variant:** Non-paginated grid with drag-and-drop row reordering.
> No search or filters — the dataset is small enough to display in full.

### Sub-entity grid filtered by parent

> Create a datagrid for `ProductVariant` as a sub-entity grid of Product.
>
> **Columns:** name, sku, price, stock, variantStatus as editable chip, isAvailable.
>
> **Search:** by name and sku.
>
> The grid is filtered by the parent product ID passed as a prop.

### Grid with optional relation filter prop

> Create a datagrid for `ProductReview`.
>
> **Columns:** title, rating, reviewerName, product name, reviewedAt, isApproved.
>
> **Search:** by title and reviewerName.
>
> **Filters:** product (relation filter with autocomplete), isApproved.
>
> **Features:** Excel export. The component accepts an optional `productId` prop
> to filter reviews for a specific product (for reuse on the Product detail page).

### Add a column to an existing grid

> Add a `variantCount` column to the `Product` datagrid showing the number of variants per product in a grey Chip.