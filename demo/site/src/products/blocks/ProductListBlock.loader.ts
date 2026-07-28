import { type BlockLoaderOptions, gql } from "@dextinity/site-nextjs";
import type { ProductListBlockData } from "@src/blocks.generated";
import { createSitePath } from "@src/util/createSitePath";

import type { GQLProductListBlockQuery, GQLProductListBlockQueryVariables } from "./ProductListBlock.loader.generated";

export type LoadedData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ blockData, graphQLFetch, scope }: BlockLoaderOptions<ProductListBlockData>) => {
    if (blockData.ids.length === 0) {
        return [];
    }

    const data = await graphQLFetch<GQLProductListBlockQuery, GQLProductListBlockQueryVariables>(
        gql`
            query ProductListBlock($ids: [ID!]!) {
                productsByIds(ids: $ids) {
                    ...ProductListBlockProduct
                }
            }

            fragment ProductListBlockProduct on Product {
                id
                title
                slug
            }
        `,
        { ids: blockData.ids },
    );

    return data.productsByIds.map((product) => ({
        ...product,
        path: createSitePath({ scope, path: `/product/${product.slug}` }),
    }));
};
