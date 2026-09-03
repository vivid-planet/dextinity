---
title: comet-admin-enum
sidebar_position: 2
---

The `comet-admin-enum` skill generates React components for displaying and editing GraphQL enums in the Comet admin. It covers translations, colored chips, inline-editable chips, and form field components.

## What It Generates

- **Translation component** — maps enum values to translated labels using `react-intl`
- **Chip component** — colored `MuiChip` for displaying enum values (e.g., status badges)
- **Editable chip** — chip with a dropdown menu that triggers an Apollo mutation to change the value inline
- **Form field components** — `SelectField`, `AutocompleteField`, `RadioGroupField`, `CheckboxListField`

## Key Features

- All components are fully typed against the generated GraphQL enum
- Chip colors are configurable per enum value
- Editable chips handle optimistic updates and error states
- Form fields integrate with Final Form and support validation

## Examples

:::tip
Skills should trigger automatically based on your prompt. If a skill does not activate as expected, you can force it by prefixing your prompt with "Use the comet-admin-enum skill" (or `/comet-admin-enum`).
:::

### All components at once

> Create all enum components for `productStatus`

### Translation component

> Create a translation component for `productStatus`

### Chip

> Create a chip for `productStatus`

### Editable chip

> Create an editable chip for `productStatus` on the `Product` entity

### Select field

> Create a select field for `productStatus`

### Autocomplete field

> Create an autocomplete field for `productStatus`

### Radio group field

> Create a radio group field for `productStatus`

### Checkbox list field

> Create a checkbox list field for `productStatus`