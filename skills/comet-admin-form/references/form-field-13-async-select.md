# AsyncSelectField (Dropdown Relation)

Alternative to `AsyncAutocompleteField` for relation fields. Renders a dropdown select that loads options asynchronously. Use when the number of options is small and a full autocomplete search is unnecessary.

**When to use:** The API query returns **all items at once without pagination** (no `search` parameter). The option list is small (< ~50 items). If the API supports pagination and search, use [AsyncAutocompleteField](form-field-07-many-to-one.md) instead.

## Basic usage

```tsx
<AsyncSelectField
    variant="horizontal"
    fullWidth
    name="category"
    label={<FormattedMessage id="product.category" defaultMessage="Category" />}
    loadOptions={async () => {
        const { data } = await client.query<GQLProductCategoriesSelectQuery, GQLProductCategoriesSelectQueryVariables>({
            query: gql`
                query ProductCategoriesSelect {
                    productCategories {
                        nodes {
                            id
                            title
                        }
                    }
                }
            `,
        });
        return data.productCategories.nodes;
    }}
    getOptionLabel={(option) => option.title}
/>
```

## Multiple selection

Add the `multiple` prop for ManyToMany relations:

```tsx
<AsyncSelectField
    variant="horizontal"
    fullWidth
    name="tags"
    label={<FormattedMessage id="product.tags" defaultMessage="Tags" />}
    multiple
    loadOptions={async () => {
        const { data } = await client.query<GQLProductTagsSelectQuery, GQLProductTagsSelectQueryVariables>({
            query: gql`
                query ProductTagsSelect {
                    productTags {
                        nodes {
                            id
                            title
                        }
                    }
                }
            `,
        });
        return data.productTags.nodes;
    }}
    getOptionLabel={(option) => option.title}
/>
```

## Dependent AsyncSelectFields

For dependent selects (where one field's options depend on another field's value), see [form-pattern-01-conditional-fields.md](form-pattern-01-conditional-fields.md#pattern-cross-field-filtering-for-async-select-fields).

## When to use AsyncSelectField vs AsyncAutocompleteField

| Criteria           | AsyncSelectField                 | AsyncAutocompleteField        |
| ------------------ | -------------------------------- | ----------------------------- |
| Option set size    | Small (< ~50)                    | Large / unbounded             |
| API query          | Returns all items, no pagination | Paginated with `search` param |
| Search support     | No                               | Yes (server-side)             |
| UX pattern         | Dropdown select                  | Autocomplete with text input  |
| Component style    | Inline in form                   | Separate reusable component   |
| Reuse across forms | Typically no                     | Yes                           |

## handleSubmit output

```ts
// Single relation
category: formValues.category ? formValues.category.id : null,

// Multiple relation
tags: formValues.tags ? formValues.tags.map((tag) => tag.id) : [],
```

## Rules

- Import `AsyncSelectField` from `@comet/admin`
- The `loadOptions` callback takes **no arguments** (unlike AsyncAutocompleteField which receives `search`)
- After adding GQL queries, run codegen (codegen watcher) so the generated types become available
- Prefer `AsyncAutocompleteField` (as reusable component) when the field is used across multiple forms
- Prefer `AsyncSelectField` for simple, form-specific relations with few options and no pagination
