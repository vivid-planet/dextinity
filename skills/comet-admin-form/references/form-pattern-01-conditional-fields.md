# Conditional Field Visibility

Show or hide fields based on another field's value. Uses Final Form's `Field` with selective subscription and MUI's `Collapse` for smooth animation.

## Pattern: Toggle visibility with a boolean field

```tsx
import { Field } from "@comet/admin";
import { Collapse } from "@mui/material";

{
    /* Toggle field */
}
<SwitchField
    name="useAlternativeAddress"
    fieldLabel={<FormattedMessage id="<entityName>.useAlternativeAddress" defaultMessage="Use alternative address" />}
    variant="horizontal"
    fullWidth
/>;

{
    /* Conditional fields */
}
<Field name="useAlternativeAddress" subscription={{ value: true }}>
    {({ input: { value } }) => (
        <Collapse in={value}>
            <TextField
                variant="horizontal"
                fullWidth
                name="alternativeAddress.street"
                label={<FormattedMessage id="<entityName>.alternativeStreet" defaultMessage="Street" />}
            />
            <TextField
                variant="horizontal"
                fullWidth
                name="alternativeAddress.zip"
                label={<FormattedMessage id="<entityName>.alternativeZip" defaultMessage="ZIP" />}
            />
        </Collapse>
    )}
</Field>;
```

## Pattern: Reset dependent field when parent changes

Use `OnChangeField` to reset a field when its dependency changes:

```tsx
import { OnChangeField } from "@comet/admin";

<AsyncAutocompleteField
    name="country"
    label={<FormattedMessage id="<entityName>.country" defaultMessage="Country" />}
    {...countryAutocompleteProps}
/>

<OnChangeField name="country">
    {(value, previousValue) => {
        if (value?.id !== previousValue?.id) {
            form.change("manufacturer", undefined);
        }
    }}
</OnChangeField>

<AsyncAutocompleteField
    name="manufacturer"
    label={<FormattedMessage id="<entityName>.manufacturer" defaultMessage="Manufacturer" />}
    disabled={!values?.country}
    {...manufacturerAutocompleteProps}
/>
```

## Pattern: Cross-field filtering for async select fields

When one async select field should filter its options based on another field's value (e.g. selecting a category first, then filtering products by that category), extract the dependent field into a reusable component that accepts a filter prop.

### Reusable filtered component

Create a reusable `<RelatedEntity>AsyncSelectField` (or `AsyncAutocompleteField` for large option sets) that accepts filter variables as a prop. Place it in the related entity's domain folder, following the same pattern as [form-field-07-many-to-one.md](form-field-07-many-to-one.md).

**GQL Definitions**

```ts
import { gql } from "@apollo/client";

export const <relatedEntity>AsyncSelectFieldQuery = gql`
    query <RelatedEntity>AsyncSelectField($filter: <RelatedEntity>Filter) {
        <relatedEntity>s(filter: $filter) {
            nodes {
                id
                <labelField>
            }
        }
    }
`;
```

**Component**

```tsx
import { useApolloClient } from "@apollo/client";
import { AsyncSelectField, type AsyncSelectFieldProps } from "@comet/admin";
import { type FunctionComponent } from "react";

import { <relatedEntity>AsyncSelectFieldQuery } from "./<RelatedEntity>AsyncSelectField.gql";
import {
    type GQL<RelatedEntity>AsyncSelectFieldQuery,
    type GQL<RelatedEntity>AsyncSelectFieldQueryVariables,
} from "./<RelatedEntity>AsyncSelectField.gql.generated";

type <RelatedEntity>AsyncSelectFieldOption = GQL<RelatedEntity>AsyncSelectFieldQuery["<relatedEntity>s"]["nodes"][number];

type <RelatedEntity>AsyncSelectFieldProps = Omit<
    AsyncSelectFieldProps<<RelatedEntity>AsyncSelectFieldOption>,
    "loadOptions" | "getOptionLabel"
> & {
    filter?: GQL<RelatedEntity>AsyncSelectFieldQueryVariables["filter"];
};

export const <RelatedEntity>AsyncSelectField: FunctionComponent<<RelatedEntity>AsyncSelectFieldProps> = ({
    filter,
    variant = "horizontal",
    fullWidth = true,
    ...restProps
}) => {
    const client = useApolloClient();

    return (
        <AsyncSelectField
            variant={variant}
            fullWidth={fullWidth}
            getOptionLabel={(option) => option.<labelField>}
            {...restProps}
            loadOptions={async () => {
                const { data } = await client.query<
                    GQL<RelatedEntity>AsyncSelectFieldQuery,
                    GQL<RelatedEntity>AsyncSelectFieldQueryVariables
                >({
                    query: <relatedEntity>AsyncSelectFieldQuery,
                    variables: { filter },
                });
                return data.<relatedEntity>s.nodes;
            }}
        />
    );
};
```

### Usage in the form

```tsx
import { OnChangeField } from "@comet/admin";
import { ProductAsyncSelectField } from "@src/products/components/productAsyncSelectField/ProductAsyncSelectField";

{
    /* Parent field */
}
<CategoryAsyncAutocompleteField name="category" variant="horizontal" fullWidth />;

{
    /* Reset dependent field when parent changes */
}
<OnChangeField name="category">
    {(value, previousValue) => {
        if (value?.id !== previousValue?.id) {
            form.change("product", undefined);
        }
    }}
</OnChangeField>;

{
    /* Dependent field — filtered by parent value */
}
<ProductAsyncSelectField
    name="product"
    label={<FormattedMessage id="<entityName>.product" defaultMessage="Product" />}
    disabled={!values?.category}
    filter={{ category: { equal: values.category?.id } }}
/>;
```

### Key points

- Extract the filtered field into a reusable component with a `filter` prop — same approach as reusable `AsyncAutocompleteField` components
- The dependent field is `disabled` until the parent has a value
- `OnChangeField` resets the dependent field when the parent changes to avoid stale selections
- The FinalForm must use `subscription={{ values: true }}` and the render function must expose both `values` and `form`

## handleSubmit — strip conditional fields

When a toggle controls optional nested fields, strip them if the toggle is off:

```ts
const output = {
    ...formValues,
    alternativeAddress: formValues.useAlternativeAddress ? formValues.alternativeAddress : null,
    useAlternativeAddress: undefined, // virtual field, not in GQL input
};
```

## Rules

- Use `subscription={{ value: true }}` on the `Field` wrapper to minimize re-renders — only re-render when the watched value changes
- Import `OnChangeField` from `@comet/admin` for dependent field resets
- When using `OnChangeField`, the FinalForm `subscription` must include `values: true` and the render function must expose `form`
- Always handle the disabled/hidden fields in `handleSubmit` — strip or null them when their toggle is off
