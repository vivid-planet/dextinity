import { type BlockLoaderOptions, gql } from "@dextinity/site-nextjs";
import type { NewsLinkBlockData } from "@src/blocks.generated";

import type { GQLNewsBlockDetailQuery, GQLNewsBlockDetailQueryVariables } from "./NewsDetailBlock.loader.generated";

export type LoadedData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<NewsLinkBlockData>) => {
    if (!blockData.id) {
        return null;
    }
    const data = await graphQLFetch<GQLNewsBlockDetailQuery, GQLNewsBlockDetailQueryVariables>(
        gql`
            query NewsBlockDetail($id: ID!) {
                news(id: $id) {
                    title
                }
            }
        `,
        { id: blockData.id },
    );
    return data.news;
};
