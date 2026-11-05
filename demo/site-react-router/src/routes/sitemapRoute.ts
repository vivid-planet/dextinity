import { gql } from "@dextinity/site-react-router";
import { noStoreCacheControl, type Sitemap, sitemapResponse } from "@dextinity/site-react-router/server";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/sitemapRoute";
import type { GQLPrebuildPageDataListSitemapQuery, GQLPrebuildPageDataListSitemapQueryVariables } from "./sitemapRoute.generated";

export async function loader({ context }: Route.LoaderArgs) {
    const sitemap: Sitemap = [];
    const graphqlFetch = createGraphQLFetch(context);
    const { siteConfig, visibility } = getSiteContext(context);

    for (const language of siteConfig.scope.languages) {
        const domain = siteConfig.scope.domain;
        const scope = { domain, language };

        let totalCount = 0;
        let currentCount = 0;

        do {
            const { paginatedPageTreeNodes } = await graphqlFetch<GQLPrebuildPageDataListSitemapQuery, GQLPrebuildPageDataListSitemapQueryVariables>(
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

    // The sitemap of the site preview contains the unpublished pages
    return sitemapResponse(sitemap, { headers: { "Cache-Control": visibility === "default" ? "public, max-age=900" : noStoreCacheControl } });
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
