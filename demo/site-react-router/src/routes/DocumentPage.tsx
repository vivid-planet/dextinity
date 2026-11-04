import { gql, type GraphQLFetch } from "@dextinity/site-react";
import { cacheControlHeaders, notFound, redirect } from "@dextinity/site-react-router";
import type { ExternalLinkBlockData, InternalLinkBlockData, NewsLinkBlockData, RedirectsLinkBlockData } from "@src/blocks.generated";
import { redirectToLink } from "@src/documents/links/redirectToLink.server";
import { loadPage } from "@src/documents/pages/loadPage.server";
import { Page } from "@src/documents/pages/Page";
import type { GQLPageTreeNodeScope } from "@src/graphql.generated";
import { getPredefinedPageRewrite } from "@src/middleware/predefinedPages.server";
import { NewsArticleJsonLd } from "@src/news/NewsArticleJsonLd";
import { NewsPage } from "@src/news/NewsPage";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { getGraphQLFetch } from "@src/util/graphQLClient.server";
import { getPageHeaders } from "@src/util/pageCacheControl.server";
import { getSiteConfigForDomain } from "@src/util/siteConfig.server";
import { getSiteContext } from "@src/util/siteContext";
import { data, matchPath } from "react-router";

import type { Route } from "./+types/DocumentPage";
import type { GQLDocumentTypeQuery, GQLDocumentTypeQueryVariables } from "./DocumentPage.generated";
import { loadNewsDetailPage, loadNewsIndexPage } from "./news/loadNewsPages.server";
import { NewsDetailContent } from "./news/NewsDetailContent";

const documentTypeQuery = gql`
    query DocumentType(
        $skipPage: Boolean!
        $path: String!
        $scope: PageTreeNodeScopeInput!
        $redirectSource: String!
        $redirectScope: RedirectScopeInput!
    ) {
        pageTreeNodeByPath(path: $path, scope: $scope) @skip(if: $skipPage) {
            id
            documentType
        }
        redirectBySource(source: $redirectSource, sourceType: path, scope: $redirectScope) {
            target
        }
    }
`;

type Params = ContentScope & { path: string[] };

async function fetchPageTreeNode({ domain, language, path: pathParam, graphQLFetch }: Params & { graphQLFetch: GraphQLFetch }) {
    const siteConfig = getSiteConfigForDomain(domain);

    // Redirects are scoped by domain only, not by language.
    // If the language param isn't a valid language, it may still be the first segment of a redirect source.
    // In that case we skip resolving page and only check if the path is a redirect source.
    const skipPage = !siteConfig.scope.languages.includes(language);

    const path = `/${pathParam.join("/")}`;
    const { scope } = { scope: { domain, language } };
    return graphQLFetch<GQLDocumentTypeQuery, GQLDocumentTypeQueryVariables>(
        documentTypeQuery,
        {
            skipPage,
            path,
            scope,
            redirectSource: `/${language}${path !== "/" ? path : ""}`,
            redirectScope: { domain: scope.domain },
        },
        { method: "GET" }, //for request memoization
    );
}

async function loadDocument(params: Params & { graphQLFetch: GraphQLFetch }) {
    const { domain, language, graphQLFetch } = params;
    const scope = { domain, language };
    const data = await fetchPageTreeNode(params);

    if (!data.pageTreeNodeByPath?.documentType) {
        if (data.redirectBySource?.target) {
            const target = data.redirectBySource?.target as RedirectsLinkBlockData;
            let destination: string | undefined;
            if (target.block !== undefined) {
                switch (target.block.type) {
                    case "internal": {
                        const internalLink = target.block.props as InternalLinkBlockData;
                        if (internalLink.targetPage) {
                            destination = createSitePath({
                                path: internalLink.targetPage.path,
                                scope: internalLink.targetPage.scope as GQLPageTreeNodeScope,
                            });
                        }
                        break;
                    }
                    case "external":
                        destination = (target.block.props as ExternalLinkBlockData).targetUrl;
                        break;
                    case "news": {
                        const newsLink = target.block.props as NewsLinkBlockData;
                        if (newsLink.news) {
                            destination = `/${newsLink.news.scope.language}/news/${newsLink.news.slug}`;
                        }
                        break;
                    }
                }
                if (destination) {
                    redirect(destination);
                }
            }
        }
        notFound();
    }

    const pageTreeNodeId = data.pageTreeNodeByPath.id;
    switch (data.pageTreeNodeByPath.documentType) {
        case "Page":
            return { type: "page" as const, ...(await loadPage({ pageTreeNodeId, scope, graphQLFetch })) };
        case "Link":
            return redirectToLink({ pageTreeNodeId, graphQLFetch });
        default:
            throw new Error(`Unknown document type ${data.pageTreeNodeByPath.documentType}`);
    }
}

/**
 * Pages of the code, e.g. the news, below the path of their predefined page in the page tree, see `predefinedPagesMiddleware`
 */
async function loadPredefinedPage(codePath: string, { scope, graphQLFetch }: { scope: ContentScope; graphQLFetch: GraphQLFetch }) {
    if (matchPath("/:language/news", codePath)) {
        return { type: "newsIndex" as const, ...(await loadNewsIndexPage({ scope, graphQLFetch })) };
    }
    const newsDetailMatch = matchPath("/:language/news/:slug", codePath);
    if (newsDetailMatch?.params.slug) {
        return { type: "newsDetail" as const, ...(await loadNewsDetailPage({ scope, slug: newsDetailMatch.params.slug, graphQLFetch })) };
    }
    notFound();
}

export const headers = cacheControlHeaders;

export const meta: Route.MetaFunction = ({ loaderData }) => (loaderData && "metadata" in loaderData ? loaderData.metadata : []);

/**
 * The pages of the page tree, e.g. `/en/about/team` for the path `/about/team`
 */
export async function loader({ params, url, context }: Route.LoaderArgs) {
    const { domain } = getSiteContext(context);
    const graphQLFetch = getGraphQLFetch(context);
    const scope = { domain, language: params.language };

    const predefinedPageCodePath = await getPredefinedPageRewrite(domain, url.pathname);
    if (predefinedPageCodePath) {
        return data(await loadPredefinedPage(predefinedPageCodePath, { scope, graphQLFetch }), getPageHeaders(context));
    }

    // React Router has already decoded the path
    const path = (params["*"] ?? "").split("/").filter((segment) => segment !== "");
    return data(await loadDocument({ ...scope, path, graphQLFetch }), getPageHeaders(context));
}

export default function DocumentPage({ loaderData }: Route.ComponentProps) {
    switch (loaderData.type) {
        case "page":
            return <Page {...loaderData} />;
        case "newsIndex":
            return <NewsPage scope={loaderData.scope} initialData={loaderData.initialData} />;
        case "newsDetail":
            return (
                <>
                    <NewsArticleJsonLd news={loaderData.news} scope={loaderData.scope} />
                    <NewsDetailContent news={loaderData.news} />
                </>
            );
    }
}
