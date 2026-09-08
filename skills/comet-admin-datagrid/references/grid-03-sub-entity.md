# Grid Variant: Sub-Entity (with Parent ID)

Used when the grid shows entities scoped to a parent (e.g. variants of a product). The parent ID is passed as a required prop and forwarded to the query.

## Template

```tsx
type ProductVariantsGridProps = {
    product: string; // parent entity ID
};

export function ProductVariantsGrid({ product }: ProductVariantsGridProps) {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = {
        ...useDataGridRemote({
            queryParamsPrefix: "product-variants",
        }),
        ...usePersistentColumnState("ProductVariantsGrid"),
    };

    // ... columns

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);
    const { data, loading, error } = useQuery<GQLProductVariantsGridQuery, GQLProductVariantsGridQueryVariables>(productVariantsQuery, {
        variables: {
            product, // forwarded parent ID
            filter: gqlFilter,
            search: gqlSearch,
            sort: muiGridSortToGql(dataGridProps.sortModel, columns) ?? [],
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
        },
    });
    // ...
}
```

## GQL

```graphql
query ProductVariantsGrid($product: ID!, $offset: Int!, $limit: Int!, $sort: [ProductVariantSort!], $search: String, $filter: ProductVariantFilter) {
    productVariants(product: $product, offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter) {
        nodes {
            ...ProductVariantsGridItem
        }
        totalCount
    }
}
```

## Rules

- The parent ID argument (e.g. `$product: ID!`) is a required prop on the grid component
- Pass it to both the query variables and to `useDataGridExcelExport` variables (if excel export is used)
- Otherwise the grid follows the standard paginated pattern
