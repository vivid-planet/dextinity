---
name: comet-admin-translatable-enum
description: |
    Creates React translatable enum components, colored chip components, editable chip components
    (with Apollo query + mutation), Final Form field components (Select, Autocomplete, RadioGroup,
    CheckboxList), for GraphQL enums. Use when a user asks to "create a translation component for X enum", "create a chip for X enum", "create a
    status chip for X enum", "create an editable chip for X enum on Y entity", "create a
    select/autocomplete/radio/checkbox field for X enum". Also use when a GQL enum type from @src/graphql.generated 
    is referenced in admin code. Handles both explicit requests and auto-detection during
    feature work.
---

# Translatable Enum Skill

Generate translatable enum components, chips, editable chips, and form field components by reading the GraphQL schema and producing files following the patterns in `references/`.

## Prerequisites

1. **Find enum values** — look up the enum in `api/schema.gql` or the generated types file.
2. **Check if file already exists** — before creating, search for an existing component. If it exists, reuse it.
3. **Confirm output path** with the user if the domain is unclear.

## Core Imports

| Import                         | Source                                                | Purpose                                                          |
| ------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| `createTranslatableEnum`       | `@src/common/components/enums/createTranslatableEnum` | Factory for translatable enum component                          |
| `defineMessage`                | `react-intl`                                          | Define i18n message descriptors                                  |
| `EnumChip`                     | `@src/common/components/enums/enumChip/EnumChip`      | Generic chip wrapper with dropdown menu                          |
| `ChipIcon`                     | project-specific path                                 | Loading/dropdown icon for chips                                  |
| `recordToOptions`              | `@src/common/components/enums/recordToOptions`        | Convert record to options array for Select/Radio/Checkbox fields |
| `useAutocompleteOptions`       | `@src/common/components/enums/useAutocompleteOptions` | Hook for autocomplete field options                              |
| `SelectField`                  | `@comet/admin`                                        | Select dropdown field                                            |
| `AutocompleteField`            | `@comet/admin`                                        | Autocomplete with search/filter                                  |
| `RadioGroupField`              | `@comet/admin`                                        | Radio group field                                                |
| `CheckboxListField`            | `@comet/admin`                                        | Checkbox list multi-select field                                 |
| `LocalErrorScopeApolloContext` | `@comet/admin`                                        | Scoped error handling for editable chips                         |

## Generation Workflow

### Step 1 — Verify helpers exist (BEFORE generating components)

Before generating any component, verify these helpers exist. Create from helper references if missing:

| Helper                   | Expected path                                     | Reference                                                                                     |
| ------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `createTranslatableEnum` | Search in project, typically in common/enums area | [enum-helper-create-translatable-enum.md](references/enum-helper-create-translatable-enum.md) |
| `EnumChip`               | Search in project, typically in common/enums area | [enum-helper-enum-chip.md](references/enum-helper-enum-chip.md)                               |
| `ChipIcon`               | Search in project (project-specific)              | [enum-helper-chip-icon.md](references/enum-helper-chip-icon.md)                               |
| `recordToOptions`        | Search in project, typically in common/enums area | [enum-helper-record-to-options.md](references/enum-helper-record-to-options.md)               |

### Step 2 — Generate the translatable enum (base component)

**Always read [enum-00-translatable.md](references/enum-00-translatable.md) first** — it is the base pattern. Every other component depends on this.

### Step 3 — Generate the requested component

Read the applicable reference file for the component type the user requested. Default to **SelectField** for form fields if unspecified.

### Step 4 — Generate Storybook stories (conditional)

Only generate story files when Storybook is set up in the package (check for a `.storybook/` folder or config in the project). Story patterns are included in each reference file.

## Key Rules

- The translation `id` should have semantic meaning derived from the file path (e.g. `location/components/locationStatus/LocationStatus` → `location.locationStatus.active`).
- Files with `.generated` suffix are auto-generated by GraphQL codegen — do not create them manually.
- Prefer `<FormattedMessage>` over `intl.formatMessage()` wherever possible. Only use `intl.formatMessage()` when a prop requires a plain `string` type.
- Always check if the component already exists before creating — reuse existing components.
- For editable chips, auto-detect the query and mutation from `api/schema.gql`. Ask the user if ambiguous.

## Component Type Reference

Read the relevant reference file based on what the user requests:

| Component                    | When to use                                                     | Reference                                                                   |
| ---------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Translatable Enum** (base) | Always created first — provides labels, component, message maps | [enum-00-translatable.md](references/enum-00-translatable.md)               |
| **Chip**                     | Colored chip display with optional dropdown                     | [enum-01-chip.md](references/enum-01-chip.md)                               |
| **Editable Chip**            | Chip + Apollo query/mutation for inline editing                 | [enum-02-editable-chip.md](references/enum-02-editable-chip.md)             |
| **SelectField**              | Default single-value form field selection                       | [enum-03-select-field.md](references/enum-03-select-field.md)               |
| **AutocompleteField**        | Many options, supports search/filter                            | [enum-04-autocomplete-field.md](references/enum-04-autocomplete-field.md)   |
| **RadioGroupField**          | Few options (<=4), all visible at once                          | [enum-05-radio-group-field.md](references/enum-05-radio-group-field.md)     |
| **CheckboxListField**        | Multi-select (form state is an array)                           | [enum-06-checkbox-list-field.md](references/enum-06-checkbox-list-field.md) |

## Helper References

| Helper                   | Purpose                                     | Reference                                                                                     |
| ------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `createTranslatableEnum` | Factory function for all translatable enums | [enum-helper-create-translatable-enum.md](references/enum-helper-create-translatable-enum.md) |
| `EnumChip`               | Generic chip wrapper with dropdown menu     | [enum-helper-enum-chip.md](references/enum-helper-enum-chip.md)                               |
| `ChipIcon`               | Loading/dropdown state icon for chips       | [enum-helper-chip-icon.md](references/enum-helper-chip-icon.md)                               |
| `recordToOptions`        | Convert record to options array             | [enum-helper-record-to-options.md](references/enum-helper-record-to-options.md)               |

## Auto-detection

When working on a feature and a GQL enum type from `@src/graphql.generated` is needed in admin code, proactively check whether a translatable enum file exists for it. If not, create one as part of the feature work without waiting for an explicit request.

## Cross-skill Integration

- The **comet-admin-form** skill uses enum field components (SelectField, RadioGroupField, CheckboxListField) in forms. It will call this skill to create missing enum fields.
- The **comet-admin-datagrid** skill uses chip components in grid columns. It will call this skill to create missing chips.
