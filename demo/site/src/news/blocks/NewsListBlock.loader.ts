import { type BlockLoaderOptions, gql } from "@dextinity/site-nextjs";
import type { NewsListBlockData } from "@src/blocks.generated";
import { buildNewsItemList } from "@src/util/structuredData/buildNewsItemList";

import type { GQLNewsListBlockQuery, GQLNewsListBlockQueryVariables } from "./NewsListBlock.loader.generated";

export type LoadedData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ blockData, graphQLFetch }: BlockLoaderOptions<NewsListBlockData>) => {
    if (blockData.ids.length === 0) {
        return { news: [], structuredData: null };
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

    const news = data.newsListByIds;
    // Structured data is built server-side because the block renders inside a client component without access to the site config.
    const structuredData = news.length > 0 ? buildNewsItemList({ items: news, scope: news[0].scope }) : null;

    return { news, structuredData };
};
