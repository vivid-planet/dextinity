import { type BlockLoaderOptions, gql } from "@dextinity/site-nextjs";
import type { ProductTeaserBlockData } from "@src/blocks.generated";

import type { GQLProductTeaserBlockQuery, GQLProductTeaserBlockQueryVariables } from "./ProductTeaserBlock.loader.generated";

export type LoadedData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<ProductTeaserBlockData>) => {
    if (!blockData.productId) {
        return null;
    }

    const data = await graphQLFetch<GQLProductTeaserBlockQuery, GQLProductTeaserBlockQueryVariables>(
        gql`
            query ProductTeaserBlock($id: ID!) {
                product(id: $id) {
                    id
                    title
                    description
                    price
                }
            }
        `,
        { id: blockData.productId },
    );

    return data.product;
};
