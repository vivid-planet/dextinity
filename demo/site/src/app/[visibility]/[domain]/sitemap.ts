import { createSitePath } from "@src/util/createSitePath";

export const dynamic = "force-dynamic"; // don't generate at build time

import { gql } from "@dextinity/site-nextjs";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { getSiteConfig } from "@src/util/siteConfig";
import type { MetadataRoute } from "next";

import type { GQLPrebuildPageDataListSitemapQuery, GQLPrebuildPageDataListSitemapQueryVariables } from "./sitemap.generated";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemap: MetadataRoute.Sitemap = [];
    const graphqlFetch = createGraphQLFetch();

    const siteConfig = await getSiteConfig();

    for (const language of siteConfig.scope.languages) {
        const domain = siteConfig.scope.domain;
        const scope = { domain, language };

        const limit = 50;
        let offset = 0;
        let totalCount = 0;

        do {
            const { paginatedPageTreeNodes } = await graphqlFetch<GQLPrebuildPageDataListSitemapQuery, GQLPrebuildPageDataListSitemapQueryVariables>(
                pageDataListQuery,
                {
                    scope,
                    offset,
                    limit,
                },
            );
            totalCount = paginatedPageTreeNodes.totalCount;
            offset += limit;

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
        } while (offset < totalCount);
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
