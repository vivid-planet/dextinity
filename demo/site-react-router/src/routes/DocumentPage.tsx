import { gql, type GraphQLFetch } from "@dextinity/site-react";
import { cacheControlHeaders, notFound, redirect } from "@dextinity/site-react-router";
import type { ExternalLinkBlockData, InternalLinkBlockData, NewsLinkBlockData, RedirectsLinkBlockData } from "@src/blocks.generated";
import { redirectToLink } from "@src/documents/links/redirectToLink";
import { loadPageMetadata } from "@src/documents/pages/loadPage";
import { Page } from "@src/documents/pages/Page";
import type { GQLPageTreeNodeScope } from "@src/graphql.generated";
import { defaultTitle } from "@src/layout/defaultTitle";
import { getPredefinedPageRewrite } from "@src/middleware/predefinedPages";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { getGraphQLFetch } from "@src/util/graphQLClient";
import { getPageHeaders } from "@src/util/pageCacheControl";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { getSiteContext } from "@src/util/siteContext";
import { data } from "react-router";

import type { Route } from "./+types/DocumentPage";
import type { GQLDocumentTypeQuery, GQLDocumentTypeQueryVariables } from "./DocumentPage.generated";
import { fetchNews } from "./news/loadNewsPages";
import { NewsDetail } from "./news/NewsDetail";
import { NewsIndex } from "./news/NewsIndex";

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

// Redirects are cached like the page
async function loadDocument(params: Params & { graphQLFetch: GraphQLFetch; pageHeaders: ResponseInit }) {
    const { domain, language, graphQLFetch, pageHeaders } = params;
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
                    redirect(destination, pageHeaders);
                }
            }
        }
        notFound();
    }

    const pageTreeNodeId = data.pageTreeNodeByPath.id;
    switch (data.pageTreeNodeByPath.documentType) {
        case "Page":
            return { type: "page" as const, pageTreeNodeId, scope, metadata: await loadPageMetadata({ pageTreeNodeId, scope, graphQLFetch }) };
        case "Link":
            return redirectToLink({ pageTreeNodeId, graphQLFetch, pageHeaders });
        default:
            throw new Error(`Unknown document type ${data.pageTreeNodeByPath.documentType}`);
    }
}

/**
 * Pages of the code, e.g. the news, below the path of their predefined page in the page tree, see `predefinedPagesMiddleware`
 */
async function loadPredefinedPage(codePath: string, { scope, graphQLFetch }: { scope: ContentScope; graphQLFetch: GraphQLFetch }) {
    // matchPath() of React Router isn't available in server components
    const [, , codePage, slug, ...rest] = codePath.split("/");
    if (codePage === "news" && slug === undefined) {
        return { type: "newsIndex" as const, scope };
    }
    if (codePage === "news" && slug && rest.length === 0) {
        const news = await fetchNews({ scope, slug, graphQLFetch });
        return { type: "newsDetail" as const, scope, slug, metadata: [{ title: news.title }] };
    }
    notFound();
}

export const headers = cacheControlHeaders;

export const meta: Route.MetaFunction = ({ loaderData }) =>
    (loaderData && "metadata" in loaderData && loaderData.metadata) || [{ title: defaultTitle }];

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
    const pageHeaders = getPageHeaders(context);
    return data(await loadDocument({ ...scope, path, graphQLFetch, pageHeaders }), pageHeaders);
}

export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
    switch (loaderData.type) {
        case "page":
            return <Page pageTreeNodeId={loaderData.pageTreeNodeId} scope={loaderData.scope} />;
        case "newsIndex":
            return <NewsIndex scope={loaderData.scope} />;
        case "newsDetail":
            return <NewsDetail scope={loaderData.scope} slug={loaderData.slug} />;
    }
}
