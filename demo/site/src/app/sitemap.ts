import { gql } from "@dextinity/site-react";
import { getSiteContext } from "@src/framework/requestContext";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import type { Context } from "hono";

import type { GQLPrebuildPageDataListSitemapQuery, GQLPrebuildPageDataListSitemapQueryVariables } from "./sitemap.generated";

type SitemapEntry = {
    url: string;
    lastModified: string;
    changeFrequency: string;
    priority: number;
};

function escapeXml(value: string) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function renderSitemapXml(sitemap: SitemapEntry[]) {
    const urls = sitemap.map(
        (entry) =>
            `<url>\n<loc>${escapeXml(entry.url)}</loc>\n<lastmod>${escapeXml(entry.lastModified)}</lastmod>\n<changefreq>${entry.changeFrequency}</changefreq>\n<priority>${entry.priority}</priority>\n</url>`,
    );
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export async function sitemapRoute(c: Context) {
    const sitemap: SitemapEntry[] = [];
    const graphqlFetch = createGraphQLFetch();

    const siteConfig = getSiteConfigForDomain(getSiteContext().domain);

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

    return c.body(renderSitemapXml(sitemap), 200, { "Content-Type": "application/xml", "Cache-Control": "public, max-age=900" });
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
