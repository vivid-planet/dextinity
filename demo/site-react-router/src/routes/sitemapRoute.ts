import { gql, type GraphQLFetch } from "@dextinity/site-react";
import { type Sitemap, sitemapResponse } from "@dextinity/site-react-router/server";
import { createSitePath } from "@src/util/createSitePath";
import { getGraphQLFetch } from "@src/util/graphQLClient.server";
import { getSiteConfigForDomain } from "@src/util/siteConfig.server";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/sitemapRoute";
import type { GQLPrebuildPageDataListSitemapQuery, GQLPrebuildPageDataListSitemapQueryVariables } from "./sitemapRoute.generated";

export async function loader({ context }: Route.LoaderArgs) {
    const { domain, visibility } = getSiteContext(context);
    return sitemapResponse(await sitemap({ domain, graphQLFetch: getGraphQLFetch(context) }), { isPreview: visibility !== "default" });
}

async function sitemap({ domain, graphQLFetch }: { domain: string; graphQLFetch: GraphQLFetch }): Promise<Sitemap> {
    const sitemap: Sitemap = [];
    const siteConfig = getSiteConfigForDomain(domain);

    for (const language of siteConfig.scope.languages) {
        const domain = siteConfig.scope.domain;
        const scope = { domain, language };

        let totalCount = 0;
        let currentCount = 0;

        do {
            const { paginatedPageTreeNodes } = await graphQLFetch<GQLPrebuildPageDataListSitemapQuery, GQLPrebuildPageDataListSitemapQueryVariables>(
                pageDataListQuery,
                {
                    scope,
                    offset: currentCount,
                    limit: 50,
                },
            );
            totalCount = paginatedPageTreeNodes.totalCount;
            currentCount += paginatedPageTreeNodes.nodes.length;

            for (const pageTreeNode of paginatedPageTreeNodes.nodes) {
                if (pageTreeNode) {
                    const path: string = pageTreeNode.path;

                    if (path && pageTreeNode.document?.__typename === "Page") {
                        const seoBlock = pageTreeNode.document.seo;
                        if (!seoBlock.noIndex) {
                            sitemap.push({
                                url: `${siteConfig.url}${createSitePath({
                                    scope: {
                                        language: language,
                                    },
                                    path: pageTreeNode.path,
                                })}`,
                                priority: Number(seoBlock.priority.replace("_", ".")),
                                changeFrequency: seoBlock.changeFrequency,
                                lastModified: pageTreeNode.document.updatedAt,
                            });
                        }
                    }
                }
            }
        } while (totalCount > currentCount);
    }

    return sitemap;
}

const pageDataListQuery = gql`
    query PrebuildPageDataListSitemap($scope: PageTreeNodeScopeInput!, $offset: Int, $limit: Int) {
        paginatedPageTreeNodes(scope: $scope, offset: $offset, limit: $limit) {
            nodes {
                id
                path
                document {
                    __typename
                    ... on Page {
                        updatedAt
                        seo
                    }
                }
            }
            totalCount
        }
    }
`;
