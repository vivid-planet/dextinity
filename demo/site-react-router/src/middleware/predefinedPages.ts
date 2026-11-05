import { gql } from "@dextinity/site-react-router";
import { predefinedPagePaths } from "@src/documents/predefinedPages/predefinedPagePaths";
import { createGraphQLFetchMiddleware } from "@src/util/graphQLClientMiddleware";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";
import { type MiddlewareFunction, redirect } from "react-router";

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

/**
 * The path in the code of a page below a predefined page of the page tree, e.g. `/en/news/some-news` for `/en/aktuelles/some-news`.
 * React Router matches the routes before the middlewares run and the browser matches them again, so the predefined pages can't be
 * rewritten like in the Next.js site. Instead, the document page renders the page of the code path, see `routes/DocumentPage.tsx`.
 */
export async function getPredefinedPageCodePath(domain: string, pathname: string): Promise<string | undefined> {
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

/**
 * Redirects the code path of a predefined page, e.g. `/en/news`, to its path in the page tree, e.g. `/en/aktuelles`
 */
export const predefinedPagesMiddleware: MiddlewareFunction<Response> = async ({ request, context }, next) => {
    const { pathname } = new URL(request.url);
    const predefinedPageRedirect = await getPredefinedPageRedirect(getSiteContext(context).domain, pathname);

    if (predefinedPageRedirect) {
        throw redirect(predefinedPageRedirect, 307);
    }

    return next();
};
