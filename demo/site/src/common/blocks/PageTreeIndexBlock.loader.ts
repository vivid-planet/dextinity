import { type BlockLoaderOptions, gql } from "@dextinity/site-nextjs";
import type { PageTreeIndexBlockData } from "@src/blocks.generated";

import type { GQLPageTreeIndexDataQuery, GQLPageTreeIndexDataQueryVariables } from "./PageTreeIndexBlock.loader.generated";

export type PageTreeNode = GQLPageTreeIndexDataQuery["paginatedPageTreeNodes"]["nodes"][number];
export type LoadedData = Awaited<ReturnType<typeof loader>>;

export const loader = async ({ graphQLFetch, scope }: BlockLoaderOptions<PageTreeIndexBlockData>) => {
    let totalCount = 0;
    let currentCount = 0;
    const pageSize = 100;
    const allNodes: PageTreeNode[] = [];

    do {
        const { paginatedPageTreeNodes } = await graphQLFetch<GQLPageTreeIndexDataQuery, GQLPageTreeIndexDataQueryVariables>(
            gql`
                query PageTreeIndexData($scope: PageTreeNodeScopeInput!, $offset: Int, $limit: Int) {
                    paginatedPageTreeNodes(scope: $scope, offset: $offset, limit: $limit) {
                        nodes {
                            id
                            name
                            path
                            parentId
                            scope {
                                domain
                                language
                            }
                        }
                        totalCount
                    }
                }
            `,
            {
                scope,
                offset: currentCount,
                limit: pageSize,
            },
            { headers: { "x-include-invisible-content": "" } },
        );

        totalCount = paginatedPageTreeNodes.totalCount;
        currentCount += paginatedPageTreeNodes.nodes.length;
        allNodes.push(...paginatedPageTreeNodes.nodes);
    } while (totalCount > currentCount);

    return allNodes;
};
