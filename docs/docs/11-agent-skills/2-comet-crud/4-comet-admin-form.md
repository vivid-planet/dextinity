---
title: comet-admin-form
sidebar_position: 4
---

The `comet-admin-form` skill generates Final Form components for the Comet admin. All forms support both create and edit modes, save conflict detection, and Apollo Client mutations.

## What It Generates

- Form component using `FinalForm` with `editMode` support
- Apollo `useQuery` for loading existing data (edit mode)
- Apollo `useMutation` for create and update operations
- Field layout using `FieldSet` grouping
- Save conflict detection via `SaveConflictDialog`

## Key Features

- All `@comet/admin` field components: text, textarea, number, checkbox, switch, select, async autocomplete, date/time pickers
- File upload fields (Dam image/file)
- Block fields (rich text, content blocks)
- Validation with field-level and form-level rules
- Automatic dirty-checking and unsaved changes warning

## Examples

:::tip
Skills should trigger automatically based on your prompt. If a skill does not activate as expected, you can force it by prefixing your prompt with "Use the comet-admin-form skill" (or `/comet-admin-form`).
:::

### Minimal 

> Create a form for `BlogPost`.

The skill reads the entity's GraphQL schema and generates a form with appropriate field types and a single FieldSet grouping all fields.

### Form with FieldSets, DAM image, and client-side validation

> Create a form for `Product`.
>
> **FieldSets:**
> - "General": name (text), slug (text), description (textarea), categories (AsyncAutocompleteField, multiple)
> - "Details": sku (text), price (number), productType (SelectField)
> - "Publishing": productStatus (SelectField), publishedAt (date picker), isPublished (switch)
> - "Media": mainImage (DAM image)
>
> **Validation:** price must be positive (client-side). sku must match format `[A-Z]{2,4}-[0-9]{4,8}` (client-side).

### Simple form with single FieldSet and relation

> Create a form for `ProductCategory`.
>
> **FieldSets:**
> - "General": name (text), slug (text), parentCategory (AsyncSelectField)

### Sub-entity form (parent set implicitly)

> Create a form for `ProductVariant` (sub-entity of Product — the product field is set implicitly from the parent).
>
> **FieldSets:**
> - "General": name (text), sku (text), variantStatus (SelectField)
> - "Pricing & Stock": price (number), stock (number), isAvailable (switch)
>
> **Validation:** price must be positive, stock must be zero or positive integer (client-side).

### Dialog-based form

> Create a form for `ProductReview` rendered inside an EditDialog (no separate page).
>
> **Fields:** product (AsyncAutocompleteField, placed at the top), title (text), body (textarea),
> rating (SelectField), reviewerName (text), reviewedAt (datetime picker), isApproved (checkbox).

### Add a field to an existing form

> Add a `notes` textarea field to the `Product` form in the "General" FieldSet.