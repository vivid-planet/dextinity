import { type BlockLoaderOptions, gql } from "@dextinity/site-nextjs";
import type { ProductDetailBlockData } from "@src/blocks.generated";

import type { GQLProductBlockDetailQuery, GQLProductBlockDetailQueryVariables } from "./ProductDetailBlock.loader.generated";

export type LoadedData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<ProductDetailBlockData>) => {
    if (!blockData.id) {
        return null;
    }
    const data = await graphQLFetch<GQLProductBlockDetailQuery, GQLProductBlockDetailQueryVariables>(
        gql`
            query ProductBlockDetail($id: ID!) {
                product(id: $id) {
                    title
                }
            }
        `,
        { id: blockData.id },
    );
    return data.product;
};
