---
name: comet-admin-form
description: |
    Generates Final Form components for a Comet DXP admin project using @comet/admin field components. All forms support create and edit modes, save conflict detection, and Apollo Client mutations.
    TRIGGER when: user says "create a form for X", "add a form for X", "generate a form", "build an edit form for X", or any similar phrase requesting a data entry form component. Also trigger when any user or agent action involves creating, modifying, or working on admin form components (FinalForm, form fields, form validation, form mutations).
---

# Comet Form Skill

Generate Final Form components by reading the GraphQL schema, determining fields, and producing form code following the patterns in `references/`.

## Prerequisites

1. **Read the GraphQL schema** for the target entity to determine: single entity query signature, `create` and `update` mutations with their input types, all field types, and whether the create mutation returns a payload with `errors` array.
2. **Include all fields by default.** Unless the user specifies otherwise, every field of the entity should be added to the form — most entities require all fields to be editable.
3. **Confirm output path** with the user if not obvious from context.

## Core Imports

| Import                       | Source             | Purpose                                                              |
| ---------------------------- | ------------------ | -------------------------------------------------------------------- |
| `FinalForm`                  | `@comet/admin`     | Form wrapper component                                               |
| `useFormApiRef`              | `@comet/admin`     | Ref to access form API imperatively                                  |
| `FinalFormSubmitEvent`       | `@comet/admin`     | Type for submit event parameter                                      |
| `Field`                      | `@comet/admin`     | Generic field wrapper                                                |
| `TextField`                  | `@comet/admin`     | Text input field                                                     |
| `TextAreaField`              | `@comet/admin`     | Multiline text field                                                 |
| `NumberField`                | `@comet/admin`     | Number input field                                                   |
| `CheckboxField`              | `@comet/admin`     | Checkbox boolean field                                               |
| `SelectField`                | `@comet/admin`     | Select dropdown field                                                |
| `SwitchField`                | `@comet/admin`     | Toggle switch boolean field                                          |
| `AsyncAutocompleteField`     | `@comet/admin`     | Async autocomplete for relations                                     |
| `AsyncSelectField`           | `@comet/admin`     | Async dropdown select for relations                                  |
| `Future_DatePickerField`     | `@comet/admin`     | Date picker field                                                    |
| `Future_DateTimePickerField` | `@comet/admin`     | DateTime picker field                                                |
| `filterByFragment`           | `@comet/admin`     | Filter query data to match fragment shape                            |
| `Loading`                    | `@comet/admin`     | Loading spinner component                                            |
| `useStackSwitchApi`          | `@comet/admin`     | Stack navigation for redirect after create                           |
| `OnChangeField`              | `@comet/admin`     | Trigger side effects on field value change                           |
| `FieldSet`                   | `@comet/admin`     | Collapsible section to group related fields                          |
| `BlockState`                 | `@comet/cms-admin` | Type for block field state                                           |
| `createFinalFormBlock`       | `@comet/cms-admin` | Integrate CMS block into Final Form                                  |
| `FileUploadField`            | `@comet/cms-admin` | File upload field (always use with downloadable fragment by default) |
| `DamImageBlock`              | `@comet/cms-admin` | DAM image block component                                            |
| `useContentScope`            | `@comet/cms-admin` | Access current content scope                                         |
| `queryUpdatedAt`             | `@comet/cms-admin` | Query updatedAt for save conflict check                              |
| `resolveHasSaveConflict`     | `@comet/cms-admin` | Resolve save conflict detection                                      |
| `useFormSaveConflict`        | `@comet/cms-admin` | Save conflict hook                                                   |

## Generation Workflow

### Step 1 — Resolve dependencies (BEFORE generating form files)

For every **enum field**:

1. Search for an existing reusable field component (e.g. glob `**/<EnumName>SelectField.tsx`, `**/<EnumName>RadioGroupField.tsx`, `**/<EnumName>CheckboxListField.tsx`)
2. If none exists — **stop and use the `comet-admin-enum` skill** to create one first

For every **ManyToOne or ManyToMany relation field**:

1. Search for an existing `<RelatedEntity>AsyncAutocompleteField.tsx`
2. If none exists — generate it now (see [form-field-07-many-to-one.md](references/form-field-07-many-to-one.md))
3. Ask the user for the correct domain path if unclear

### Step 2 — Generate the GQL definitions and Form component

**Always read [form-00-shell.md](references/form-00-shell.md) first** — it contains both the GQL and Form component base patterns. Then read the applicable field type files for each field.

## Key Rules

- The reference files cover core patterns and common usage. For any field component props, options, or features not explicitly documented here, **read the TypeScript type definitions** of the component (e.g., `TextField`, `NumberField`, `AsyncAutocompleteField`) to discover all available props and their types from @comet/admin or the project itself. The types are the source of truth — do not guess prop names or values.
- For every enum field, search for an existing reusable field component. If none exists, use the `translatable-enum` skill to create one first.
- ManyToOne/ManyToMany relation fields require a reusable `AsyncAutocompleteField` component — see [form-field-07-many-to-one.md](references/form-field-07-many-to-one.md).
- Always include `id` and `updatedAt` in the query (required for save conflict detection).
- Use exact mutation/query names from the schema — do not guess.
- Only include fields actually used in the form in the GQL fragment.
- Prefer `<FormattedMessage>` over `intl.formatMessage()` wherever possible. Only use `intl.formatMessage()` when a prop requires a plain `string` type.
- Files ending in `.gql.generated.ts` are auto-generated by codegen — do not create them manually.
- Use `subscription={{}}` on `FinalForm` by default to minimize re-renders. Only add `subscription={{ values: true }}` when the form render function needs access to `values` (e.g. for conditional fields or dependent field logic).
- **Nullable number fields cause dirty handler issues.** `filterByFragment` returns `null` for nullable fields, but `NumberField` internally normalizes `null` → `undefined` on mount (via `useEffect`), which changes the form value and triggers dirty state. Always normalize nullable number fields in `initialValues` with `?? undefined` (e.g. `purchasePrice: data.entity.purchasePrice ?? undefined`). This applies to any field whose component normalizes values on mount.
- For scoped entities, forward the content scope to mutations using `useContentScope` from `@comet/cms-admin`.
- The form needs to be wired into a Stack page (not part of this skill unless asked).

## Helper Text

All field components support a `helperText` prop for providing guidance to the user. Add `helperText` when a field's purpose, expected format, or constraints are not immediately obvious from the label alone.

```tsx
<TextField
    required
    variant="horizontal"
    fullWidth
    name="slug"
    label={<FormattedMessage id="product.slug" defaultMessage="Slug" />}
    helperText={
        <FormattedMessage
            id="product.slug.helperText"
            defaultMessage="URL-friendly identifier, e.g. 'my-product'. Only lowercase letters, numbers, and hyphens."
        />
    }
/>
```

### When to add helperText

- **Format constraints** — fields with specific formats (slugs, codes, patterns, URLs, email addresses)
- **Unit or range clarification** — number fields where the unit or valid range isn't clear from the label (e.g. "Weight in grams", "Value between 0 and 100")
- **Side effects** — fields where changing the value triggers behavior the user should know about (e.g. "Changing the slug will break existing links")
- **Relation context** — autocomplete fields where the user might not know what entity to search for or what the relation means
- **Non-obvious purpose** — fields with technical or domain-specific names that need plain-language explanation

### When NOT to add helperText

- Self-explanatory fields like "Title", "Description", "Name", "Email"
- Boolean fields where the `fieldLabel` already explains the behavior
- Enum fields where the options are self-descriptive

## Field Type Reference

Read the relevant field file based on the field type from the GraphQL schema:

| Field Type                          | Component                                                                  | Reference                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| String                              | `TextField`                                                                | [form-field-01-string.md](references/form-field-01-string.md)               |
| Text (multiline)                    | `TextAreaField`                                                            | [form-field-02-text.md](references/form-field-02-text.md)                   |
| Number / Int / Float                | `NumberField`                                                              | [form-field-03-number.md](references/form-field-03-number.md)               |
| Boolean                             | `CheckboxField`                                                            | [form-field-04-boolean.md](references/form-field-04-boolean.md)             |
| DateTime / LocalDate                | `Future_DatePickerField` / `Future_DateTimePickerField`                    | [form-field-05-datetime.md](references/form-field-05-datetime.md)           |
| Enum                                | Reusable `<EnumName>SelectField` / `RadioGroupField` / `CheckboxListField` | [form-field-06-enum.md](references/form-field-06-enum.md)                   |
| ManyToOne relation (large set)      | Reusable `<RelatedEntity>AsyncAutocompleteField`                           | [form-field-07-many-to-one.md](references/form-field-07-many-to-one.md)     |
| ManyToMany relation (large set)     | Reusable `<RelatedEntity>AsyncAutocompleteField` with `multiple`           | [form-field-08-many-to-many.md](references/form-field-08-many-to-many.md)   |
| Nested scalar object                | Individual fields with dot notation                                        | [form-field-09-nested-object.md](references/form-field-09-nested-object.md) |
| FileUpload                          | `FileUploadField` from `@comet/cms-admin`                                  | [form-field-10-file-upload.md](references/form-field-10-file-upload.md)     |
| Block (DamImage, RTE)               | `Field` + `createFinalFormBlock`                                           | [form-field-11-block.md](references/form-field-11-block.md)                 |
| Boolean (switch)                    | `SwitchField`                                                              | [form-field-12-switch.md](references/form-field-12-switch.md)               |
| Relation (small set, no pagination) | `AsyncSelectField`                                                         | [form-field-13-async-select.md](references/form-field-13-async-select.md)   |

## Relation Field Component

| Pattern                | When to use                                                       | Reference                                                                 |
| ---------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| AsyncAutocompleteField | Reusable relation field with search (large/paginated option sets) | [form-field-07-many-to-one.md](references/form-field-07-many-to-one.md)   |
| AsyncSelectField       | Inline relation dropdown (small option sets, no pagination)       | [form-field-13-async-select.md](references/form-field-13-async-select.md) |

## Layout & Patterns

### FieldSet (default layout)

**Always group form fields into `FieldSet` components by default**, unless the user explicitly requests a flat form or a different layout. Group fields by logical sections (e.g. "General", "Details", "Media", "Settings").

- All FieldSet should use `initiallyExpanded` so it's open by default
- Import `FieldSet` from `@comet/admin`

```tsx
import { FieldSet } from "@comet/admin";

<FieldSet initiallyExpanded title={<FormattedMessage id="entity.fieldSet.general" defaultMessage="General" />}>
    <TextField ... name="name" label={...} />
    <TextAreaField ... name="description" label={...} />
    <StatusSelectField ... name="status" label={...} />
</FieldSet>
<FieldSet initiallyExpanded title={<FormattedMessage id="entity.fieldSet.details" defaultMessage="Details" />}>
    <NumberField ... name="price" label={...} />
    <Future_DateTimePickerField ... name="validFrom" label={...} />
    <Future_DateTimePickerField ... name="validTo" label={...} />
</FieldSet>
<FieldSet initiallyExpanded title={<FormattedMessage id="entity.fieldSet.media" defaultMessage="Media" />}>
    <Field name="image" isEqual={isEqual} label={...} variant="horizontal" fullWidth>
        {createFinalFormBlock(rootBlocks.image)}
    </Field>
</FieldSet>
```

#### Grouping guidelines

- **General / Main Data**: core identifying fields (name, title, slug, status, type)
- **Details / Additional Data**: secondary fields (prices, dates, quantities, dimensions)
- **Media**: block fields (images, files)
- **Relations**: relation fields (categories, tags, references)
- **Settings**: configuration fields (booleans, feature flags)

Use your judgement to create sensible groups. A form with only 2-3 fields does not need FieldSets.

| Pattern               | When to use                                                | Reference                                                                                 |
| --------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Conditional fields    | Show/hide fields based on another field's value            | [form-pattern-01-conditional-fields.md](references/form-pattern-01-conditional-fields.md) |
| Cross-field filtering | Filter async select options based on another field's value | [form-pattern-01-conditional-fields.md](references/form-pattern-01-conditional-fields.md) |
| Adornments            | Add icons, units, or prefixes to input fields              | [form-pattern-02-adornments.md](references/form-pattern-02-adornments.md)                 |
| Validation            | Client-side field validation with error messages           | [form-pattern-03-validation.md](references/form-pattern-03-validation.md)                 |
| Dividers              | Visually separate groups of fields within a FieldSet       | see below                                                                                 |

### Dividers

Use a styled `Divider` to visually separate sub-groups of fields within a single FieldSet. Dividers need vertical spacing via a styled component:

```tsx
import { Divider, styled } from "@mui/material";

const FieldDivider = styled(Divider)(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

// Usage inside a FieldSet:
<TextField ... name="title" label={...} />
<TextField ... name="description" label={...} />
<FieldDivider />
<TextField ... name="address.street" label={...} />
<TextField ... name="address.zip" label={...} />
<TextField ... name="address.city" label={...} />
```

## Scoped Entities

For entities that are scoped to a content scope (language, domain), forward the scope to mutations:

```tsx
import { useContentScope } from "@comet/cms-admin";

const { scope } = useContentScope();

// In handleSubmit:
await client.mutate({
    mutation: createEntityMutation,
    variables: { input: output, scope },
});
```

Add `scope` as a required variable in the GQL mutation if the schema requires it.

## Pages & DataGrids

- When the form needs to be wired into a page, use the **comet-admin-pages** skill for Stack/StackSwitch navigation patterns.
- When a page also includes a DataGrid alongside the form, use the **comet-admin-datagrid** skill to generate it.
