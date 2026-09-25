# ManyToMany Relation Field

Same reusable `<RelatedEntity>AsyncAutocompleteField` component as ManyToOne, with `multiple` prop — see [form-field-07-many-to-one.md](form-field-07-many-to-one.md) for how to create the component.

## Component

```tsx
<ProductTagAsyncAutocompleteField multiple required name="tags" label={<FormattedMessage id="<entityName>.tags" defaultMessage="Tags" />} />
```

## handleSubmit output

```ts
tags: formValues.tags.map((item) => item.id),
```

## Custom chip rendering with `renderValue`

When multi-select chips need custom rendering (e.g. showing a color indicator, icon, or extra info), use `renderValue` on the `AsyncAutocompleteField`. **Do NOT use `renderTags` — it is deprecated.**

```tsx
import { Chip } from "@mui/material";

<AsyncAutocompleteField
    // ...other props
    renderValue={(value, getItemProps) =>
        (value as OptionType[]).map((option, index) => {
            const itemProps = getItemProps({ index });
            return <Chip key={option.id} label={option.name} icon={<MyCustomIcon />} {...itemProps} />;
        })
    }
/>;
```

**Key differences from the deprecated `renderTags`:**

- `getItemProps` does NOT return a `key` property — use `option.id` as key instead
- `value` type is a union — cast to your option type: `(value as OptionType[])`
- Use `renderOption` alongside `renderValue` to customize the dropdown items too

## Rules

- Search for an existing `<RelatedEntity>AsyncAutocompleteField.tsx` before generating a new one
- The `multiple` prop is passed through `...restProps` in the component — no special handling needed
- GQL fragment entry: `tags { id title }` (id + label field)
