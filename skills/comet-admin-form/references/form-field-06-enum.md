# Enum Fields

**Always use a reusable field from the `comet-admin-enum` skill. Check first, create if missing.**

## Single value

- <=4 options: use `<EnumName>SelectField`
- &gt;4 options: use `<EnumName>AutocompleteField`
- `<EnumName>RadioGroupField` only when explicitly requested

```tsx
<ProductStatusSelectField required name="status" label={<FormattedMessage id="<entityName>.status" defaultMessage="Status" />} />
```

## Multiple values (array)

Typically `<EnumName>CheckboxListField` or `<EnumName>SelectField` with `multiple`.

```tsx
<ProductTypeCheckboxListField
    name="additionalTypes"
    label={<FormattedMessage id="<entityName>.additionalTypes" defaultMessage="Additional Types" />}
/>
```

## Rules

- Always search for an existing reusable enum field component first (glob `**/<EnumName>SelectField.tsx`, `**/<EnumName>RadioGroupField.tsx`, `**/<EnumName>CheckboxListField.tsx`)
- If none exists, use the `comet-admin-enum` skill to create one before generating the form
