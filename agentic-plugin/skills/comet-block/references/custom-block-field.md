# Custom Block Field Rules

Detailed rules for creating custom block fields that reference entities using `createCompositeBlockField`. Load this file when a composite block needs a field that selects or references an entity (e.g., picking a product, category, or news article) rather than using a standard block or text field.

---

## Overview

`createCompositeBlockField` is a lower-level helper from `@comet/cms-admin` that creates a custom field for use inside a `createCompositeBlock` `blocks` object. It enables arbitrary admin UI (entity pickers, custom selectors, conditional inputs) while integrating with the block's state management.

Use it when the built-in helpers (`createCompositeBlockTextField`, `createCompositeBlockSelectField`, `createCompositeBlockSwitchField`) are insufficient — most commonly when a block needs to store an entity reference (e.g., a product ID selected via an autocomplete search).

---

## API Side

On the API side, the entity reference is stored as a **nullable string field** containing the entity's UUID. The block does not use a relation — it stores a plain ID that the site resolves at render time via a block loader.

```ts
class MyBlockData extends BlockData {
    @BlockField({ nullable: true })
    productId?: string;
}

class MyBlockInput extends BlockInput {
    @IsUndefinable()
    @IsString()
    @BlockField({ nullable: true })
    productId?: string;

    transformToBlockData(): MyBlockData {
        return blockInputToData(MyBlockData, this);
    }
}
```

Rules:

- Use `@BlockField({ nullable: true })` and `@IsUndefinable()` so the block is savable without a selection.
- Name the field `{entityName}Id` (e.g., `productId`, `categoryId`) to clarify it stores a reference, not the entity itself.
- The site resolves the ID to full entity data via a block loader (see [block-loader.md](block-loader.md)).

---

## Admin Side

### `createCompositeBlockField` API

Import from `@comet/cms-admin`:

```ts
import { createCompositeBlockField } from "@comet/cms-admin";
```

**Signature:**

```ts
createCompositeBlockField<State>(options: Options<State>)
```

The generic type parameter `State` is the state type for the field — typically a `string | undefined` for entity ID references or a custom object shape.

### Options

| Option                | Type                           | Required | Description                                                                                           |
| --------------------- | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------- |
| `defaultValue`        | `State`                        | Yes      | Default value for new blocks. Use `undefined` for nullable entity references.                         |
| `AdminComponent`      | `ComponentType<AdminProps>`    | Yes      | React component receiving `{ state, updateState }` that renders the admin UI for this field.          |
| `definesOwnPadding`   | `boolean`                      | No       | Whether the component defines its own padding (skips default block padding).                          |
| `extractTextContents` | `(state, options) => string[]` | No       | Extracts text content from the state for search indexing. Return entity name or title when available. |

The `AdminComponent` receives these props:

| Prop          | Type                              | Description                                         |
| ------------- | --------------------------------- | --------------------------------------------------- |
| `state`       | `State`                           | Current field state (e.g., the selected entity ID). |
| `updateState` | `Dispatch<SetStateAction<State>>` | Callback to update the field state.                 |

### Entity Selection Pattern

The most common use case is selecting an entity via async search. This combines `BlocksFinalForm`, `AsyncAutocompleteField`, and optionally `useContentScope` for scope-aware queries.

```tsx
import { AsyncAutocompleteField } from "@comet/admin";
import { BlocksFinalForm, createCompositeBlockField, useContentScope } from "@comet/cms-admin";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { type ProductPickerBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

const productPickerBlockProductSelectQuery = gql`
    query ProductPickerBlockProductSelect($scope: ProductContentScopeInput!, $search: String) {
        products(scope: $scope, search: $search) {
            nodes {
                id
                name
            }
        }
    }
`;

export const ProductPickerBlock = createCompositeBlock(
    {
        name: "ProductPicker",
        displayName: <FormattedMessage id="productPickerBlock.displayName" defaultMessage="Product Picker" />,
        blocks: {
            productId: {
                block: createCompositeBlockField<ProductPickerBlockData["productId"]>({
                    defaultValue: undefined,
                    AdminComponent: ({ state, updateState }) => {
                        const client = useApolloClient();
                        const { scope } = useContentScope();

                        return (
                            <BlocksFinalForm<{ productId: typeof state }>
                                onSubmit={({ productId }) => updateState(productId)}
                                initialValues={{ productId: state }}
                            >
                                <AsyncAutocompleteField
                                    name="productId"
                                    label={<FormattedMessage id="productPickerBlock.product" defaultMessage="Product" />}
                                    fullWidth
                                    loadOptions={async (search?: string) => {
                                        const { data } = await client.query({
                                            query: productPickerBlockProductSelectQuery,
                                            variables: { scope, search },
                                        });
                                        return data.products.nodes;
                                    }}
                                    getOptionLabel={(option) => option.name}
                                />
                            </BlocksFinalForm>
                        );
                    },
                }),
                title: <FormattedMessage id="productPickerBlock.product" defaultMessage="Product" />,
            },
        },
    },
    (block) => {
        block.previewContent = (state) => [{ type: "text", content: state.productId ?? "" }];
        return block;
    },
);
```

### Key components

**`BlocksFinalForm`** — Wraps `react-final-form` with auto-save behavior (submits on every change via `FormSpy`, no save button). Always use it inside `AdminComponent` to bridge block state and form fields.

```tsx
<BlocksFinalForm<FormValues> onSubmit={(values) => updateState(values.fieldName)} initialValues={{ fieldName: state }}>
    {/* form fields */}
</BlocksFinalForm>
```

- The generic type parameter provides type safety for form values.
- `onSubmit` fires automatically whenever a form field changes.
- `initialValues` should reflect the current block state.

**`AsyncAutocompleteField`** — Async entity search field with type-ahead. Import from `@comet/admin`.

**`useContentScope`** — Hook from `@comet/cms-admin` that provides the current content scope (domain, language). Use it when the entity query requires scope filtering.

```tsx
const { scope } = useContentScope();
```

Pass `scope` as a variable to GraphQL queries so entity search results match the active content scope.

### Showing the selected entity

When the field should display details about the currently selected entity (not just store the ID), use `useQuery` to load entity data based on the stored ID:

```tsx
AdminComponent: ({ state, updateState }) => {
    const client = useApolloClient();
    const { scope } = useContentScope();

    const { data: selectedProductData } = useQuery(
        gql`
            query ProductPickerBlockSelectedProduct($id: ID!) {
                product(id: $id) {
                    id
                    name
                    visible
                }
            }
        `,
        { variables: { id: state }, skip: !state },
    );

    const selectedProduct = selectedProductData?.product;

    return (
        <BlocksFinalForm<{ productId: typeof state }>
            onSubmit={({ productId }) => updateState(productId)}
            initialValues={{ productId: state }}
        >
            <AsyncAutocompleteField
                name="productId"
                label={<FormattedMessage id="productPickerBlock.product" defaultMessage="Product" />}
                fullWidth
                loadOptions={async (search?: string) => {
                    const { data } = await client.query({
                        query: productPickerBlockProductSelectQuery,
                        variables: { scope, search },
                    });
                    return data.products.nodes;
                }}
                getOptionLabel={(option) => option.name}
            />
            {selectedProduct && !selectedProduct.visible && (
                <Alert severity="warning">
                    <FormattedMessage
                        id="productPickerBlock.hiddenWarning"
                        defaultMessage="The selected product is not visible and will not appear on the site."
                    />
                </Alert>
            )}
        </BlocksFinalForm>
    );
},
```

Use `skip: !state` to avoid querying when no entity is selected. Include `visible` (or `status`) in the query to detect hidden entities and warn the editor.

---

## Site Side

The site receives the stored entity ID from the block data. Use a **block loader** to resolve the ID to full entity data at render time. Always filter out hidden or unpublished entities in the loader — never pass invisible entity data to the client.

```tsx
import { type PropsWithData, withPreview } from "@comet/cms-site";
import { type ProductPickerBlockData } from "@src/blocks.generated";

interface ProductPickerBlockLoaderData {
    product: { id: string; name: string; imageUrl: string } | null;
}

export const ProductPickerBlock = withPreview(
    ({ data }: PropsWithData<ProductPickerBlockData & { loaded: ProductPickerBlockLoaderData }>) => {
        const { loaded } = data;

        if (!loaded.product) {
            return null;
        }

        return <div>{loaded.product.name}</div>;
    },
    { label: "Product Picker" },
);
```

When `loaded.product` is `null` (entity deleted, unpublished, or ID missing), render nothing.

---

## Common Pitfalls

1. **Forgetting `@IsUndefinable()` on the API field** — without it, the block cannot be saved in its initial empty state because validation rejects `undefined`.
2. **Not using `skip: !state` in `useQuery`** — querying with an undefined ID causes a GraphQL error.
3. **Storing the entire entity object instead of just the ID** — block data is stored as JSON in the database. Store only the entity's UUID; resolve full data at render time via a block loader.
4. **Not filtering by scope in `loadOptions`** — in multi-scope projects, entity search results must match the current content scope so editors only see relevant entities.
5. **Not warning about hidden entities** — when the selected entity is unpublished or invisible, show a warning in the admin so editors know the block will render empty on the site.
6. **Using `useQuery` inside `loadOptions`** — `loadOptions` is an async callback, not a React component. Use `client.query()` (from `useApolloClient`) for imperative queries inside callbacks; use `useQuery` only for declarative queries in the component body.
