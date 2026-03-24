# ManyToOne Relation Field (AsyncAutocompleteField)

**Always generate a reusable `<RelatedEntity>AsyncAutocompleteField` component.**

**When to use:** The API query supports **pagination and a `search` parameter** — the option set is large or unbounded. If the API query returns all items without pagination, use [AsyncSelectField](form-field-13-async-select.md) instead.

## Creating the reusable component

Generate one `<RelatedEntity>AsyncAutocompleteField` component per relation.

Always check if the component already exists before generating. If it exists, reuse it.
Ask the user for the correct domain path if it's not obvious from the schema.

### GQL Definitions

```ts
import { gql } from "@apollo/client";

export const productCategoryAsyncAutocompleteFieldFragment = gql`
    fragment ProductCategoryAsyncAutocompleteFieldProductCategory on ProductCategory {
        id
        title
    }
`;

export const productCategoryAsyncAutocompleteFieldQuery = gql`
    query ProductCategoryAsyncAutocompleteField($search: String) {
        productCategories(search: $search) {
            nodes {
                ...ProductCategoryAsyncAutocompleteFieldProductCategory
            }
        }
    }
    ${productCategoryAsyncAutocompleteFieldFragment}
`;
```

### Component

```tsx
import { useApolloClient } from "@apollo/client";
import { AsyncAutocompleteField, type AsyncAutocompleteFieldProps } from "@comet/admin";
import { type FunctionComponent } from "react";

import {
    productCategoryAsyncAutocompleteFieldFragment,
    productCategoryAsyncAutocompleteFieldQuery,
} from "./ProductCategoryAsyncAutocompleteField.gql";
import {
    type GQLProductCategoryAsyncAutocompleteFieldProductCategoryFragment,
    type GQLProductCategoryAsyncAutocompleteFieldQuery,
    type GQLProductCategoryAsyncAutocompleteFieldQueryVariables,
} from "./ProductCategoryAsyncAutocompleteField.gql.generated";

export type ProductCategoryAsyncAutocompleteFieldOption = GQLProductCategoryAsyncAutocompleteFieldProductCategoryFragment;

type ProductCategoryAsyncAutocompleteFieldProps = Omit<
    AsyncAutocompleteFieldProps<ProductCategoryAsyncAutocompleteFieldOption, false, true, false>,
    "loadOptions"
>;

export const ProductCategoryAsyncAutocompleteField: FunctionComponent<ProductCategoryAsyncAutocompleteFieldProps> = ({
    name,
    clearable = true,
    disabled = false,
    variant = "horizontal",
    fullWidth = true,
    ...restProps
}) => {
    const client = useApolloClient();

    return (
        <AsyncAutocompleteField
            name={name}
            clearable={disabled ? false : clearable}
            disabled={disabled}
            variant={variant}
            fullWidth={fullWidth}
            getOptionLabel={(option) => option.title}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            {...restProps}
            loadOptions={async (search) => {
                const { data } = await client.query<
                    GQLProductCategoryAsyncAutocompleteFieldQuery,
                    GQLProductCategoryAsyncAutocompleteFieldQueryVariables
                >({
                    query: productCategoryAsyncAutocompleteFieldQuery,
                    variables: { search },
                });
                return data.productCategories.nodes;
            }}
        />
    );
};
```

---

## With additional query variables

When the API query requires extra variables (e.g. a content scope, a filter, or a parent entity ID), add them as component props:

### GQL Definitions

```ts
import { gql } from "@apollo/client";

export const productAsyncAutocompleteFieldFragment = gql`
    fragment ProductAsyncAutocompleteFieldProduct on Product {
        id
        title
    }
`;

export const productAsyncAutocompleteFieldQuery = gql`
    query ProductAsyncAutocompleteField($search: String, $filter: ProductFilter, $scope: ProductContentScopeInput!) {
        products(search: $search, filter: $filter, scope: $scope) {
            nodes {
                ...ProductAsyncAutocompleteFieldProduct
            }
        }
    }
    ${productAsyncAutocompleteFieldFragment}
`;
```

### Component

```tsx
import { useApolloClient } from "@apollo/client";
import { AsyncAutocompleteField, type AsyncAutocompleteFieldProps } from "@comet/admin";
import { useContentScope } from "@comet/cms-admin";
import { type FunctionComponent } from "react";

import { productAsyncAutocompleteFieldQuery } from "./ProductAsyncAutocompleteField.gql";
import {
    type GQLProductAsyncAutocompleteFieldProductFragment,
    type GQLProductAsyncAutocompleteFieldQuery,
    type GQLProductAsyncAutocompleteFieldQueryVariables,
} from "./ProductAsyncAutocompleteField.gql.generated";

export type ProductAsyncAutocompleteFieldOption = GQLProductAsyncAutocompleteFieldProductFragment;

type ProductAsyncAutocompleteFieldProps = Omit<
    AsyncAutocompleteFieldProps<ProductAsyncAutocompleteFieldOption, false, true, false>,
    "loadOptions"
> & {
    categoryId?: string;
};

export const ProductAsyncAutocompleteField: FunctionComponent<ProductAsyncAutocompleteFieldProps> = ({
    name,
    categoryId,
    clearable = true,
    disabled = false,
    variant = "horizontal",
    fullWidth = true,
    ...restProps
}) => {
    const client = useApolloClient();
    const { scope } = useContentScope();

    return (
        <AsyncAutocompleteField
            name={name}
            clearable={disabled ? false : clearable}
            disabled={disabled}
            variant={variant}
            fullWidth={fullWidth}
            getOptionLabel={(option) => option.title}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            {...restProps}
            loadOptions={async (search) => {
                const { data } = await client.query<GQLProductAsyncAutocompleteFieldQuery, GQLProductAsyncAutocompleteFieldQueryVariables>({
                    query: productAsyncAutocompleteFieldQuery,
                    variables: {
                        search,
                        scope,
                        filter: categoryId ? { category: { equal: categoryId } } : undefined,
                    },
                });
                return data.products.nodes;
            }}
        />
    );
};
```

---

## Usage in a form

```tsx
// Single relation (ManyToOne)
<ProductCategoryAsyncAutocompleteField
    name="category"
    label={<FormattedMessage id="product.category" defaultMessage="Category" />}
/>

// With additional filter prop
<ProductAsyncAutocompleteField
    name="product"
    label={<FormattedMessage id="productHighlight.product" defaultMessage="Product" />}
    categoryId={values.category?.id}
    disabled={!values?.category}
/>
```

## handleSubmit output

```ts
category: formValues.category ? formValues.category.id : null,
```

## Rules

- Search for an existing `<RelatedEntity>AsyncAutocompleteField.tsx` before generating a new one
- `<labelField>` = the human-readable label field of the related entity (e.g. `title`, `name`) — ask user if unclear
- The query must accept a `$search: String` parameter — this enables server-side filtering as the user types
- If the API query requires additional variables (e.g. scope, filter, parent ID), add them as component props and forward to `variables`
- The relation object (with `id` + label field) is stored in form values, then transformed to just the ID in `handleSubmit`
- The `multiple` prop is passed through `...restProps` — no special handling needed in the component
- `<RelatedEntity>AsyncAutocompleteField.gql.generated.ts` is auto-generated by codegen — do not create manually
- Fragment name convention: `<RelatedEntity>AsyncAutocompleteField<RelatedEntity>` (e.g. `ProductCategoryAsyncAutocompleteFieldProductCategory`)
- GQL fragment entry in the form query: `category { id title }` (id + label field)
