import { gql } from "@dextinity/site-react";
import { predefinedPagePaths } from "@src/documents/predefinedPages/predefinedPagePaths";
import { siteRoutes } from "@src/routes/router";
import { createGraphQLFetchMiddleware } from "@src/util/graphQLClientMiddleware";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";
import { createMiddleware } from "hono/factory";

import { memoryCache } from "./cache";
import type { GQLPredefinedPagesQuery, GQLPredefinedPagesQueryVariables } from "./predefinedPages.generated";

async function getPredefinedPageRedirect(domain: string, pathname: string): Promise<string | undefined> {
    const pages = await fetchPredefinedPages(domain);

    const matchingPredefinedPage = pages.find((page) => pathname.startsWith(page.codePath));

    if (matchingPredefinedPage) {
        return pathname.replace(matchingPredefinedPage.codePath, matchingPredefinedPage.pageTreeNodePath);
    }

    return undefined;
}

async function getPredefinedPageRewrite(domain: string, pathname: string): Promise<string | undefined> {
    const pages = await fetchPredefinedPages(domain);

    const matchingPredefinedPage = pages.find((page) => pathname.startsWith(page.pageTreeNodePath));

    if (matchingPredefinedPage) {
        return pathname.replace(matchingPredefinedPage.pageTreeNodePath, matchingPredefinedPage.codePath);
    }

    return undefined;
}

const predefinedPagesQuery = gql`
    query PredefinedPages($scope: PageTreeNodeScopeInput!) {
        paginatedPageTreeNodes(scope: $scope, documentType: "PredefinedPage") {
            nodes {
                id
                path
                document {
                    __typename
                    ... on PredefinedPage {
                        type
                    }
                }
            }
        }
    }
`;

const graphQLFetch = createGraphQLFetchMiddleware();

async function fetchPredefinedPages(domain: string) {
    const key = `predefinedPages-${domain}`;

    return memoryCache.wrap(key, async () => {
        const pages: Array<{ codePath: string; pageTreeNodePath: string }> = [];

        for (const language of getSiteConfigForDomain(domain).scope.languages) {
            const { paginatedPageTreeNodes } = await graphQLFetch<GQLPredefinedPagesQuery, GQLPredefinedPagesQueryVariables>(predefinedPagesQuery, {
                scope: { domain: domain, language },
            });

            for (const node of paginatedPageTreeNodes.nodes) {
                if (node.document?.__typename === "PredefinedPage" && node.document.type) {
                    pages.push({
                        codePath: `/${language}${predefinedPagePaths[node.document.type]}`,
                        pageTreeNodePath: `/${language}${node.path}`,
                    });
                }
            }
        }

        return pages;
    });
}

export const predefinedPagesMiddleware = createMiddleware(async (c, next) => {
    const { domain } = getSiteContext();

    const predefinedPageRedirect = await getPredefinedPageRedirect(domain, c.req.path);

    if (predefinedPageRedirect) {
        return c.redirect(predefinedPageRedirect, 307);
    }

    // Predefined pages are only rendered, so other methods don't need to be rewritten (and their request body forwarded)
    const predefinedPageRewrite = c.req.method === "GET" || c.req.method === "HEAD" ? await getPredefinedPageRewrite(domain, c.req.path) : undefined;

    if (predefinedPageRewrite) {
        // Hono routes by the original path, so the rewritten request is handed to the site routes directly
        const url = new URL(c.req.url);
        url.pathname = predefinedPageRewrite;
        return siteRoutes.fetch(new Request(url, c.req.raw));
    }

    await next();
});
