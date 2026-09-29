import { type BlockLoaderOptions, gql } from "@dextinity/site-nextjs";
import type { NewsListBlockData } from "@src/blocks.generated";

import type { GQLNewsListBlockQuery, GQLNewsListBlockQueryVariables } from "./NewsListBlock.loader.generated";

export type LoadedData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<NewsListBlockData>) => {
    if (blockData.ids.length === 0) {
        return [];
    }

    const data = await graphQLFetch<GQLNewsListBlockQuery, GQLNewsListBlockQueryVariables>(
        gql`
            query NewsListBlock($ids: [ID!]!) {
                newsListByIds(ids: $ids) {
                    ...NewsListBlockNews
                }
            }

            fragment NewsListBlockNews on News {
                id
                title
                slug
                scope {
                    domain
                    language
                }
            }
        `,
        { ids: blockData.ids },
    );

    return data.newsListByIds;
};
