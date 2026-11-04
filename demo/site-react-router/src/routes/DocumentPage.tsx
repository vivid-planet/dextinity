import { createMeta, gql, type GraphQLFetch } from "@dextinity/site-react-router";
import type { ExternalLinkBlockData, InternalLinkBlockData, NewsLinkBlockData, RedirectsLinkBlockData } from "@src/blocks.generated";
import { getLinkTarget } from "@src/documents/links/Link";
import { loadPageMetadata, Page } from "@src/documents/pages/Page";
import type { GQLPageTreeNodeScope } from "@src/graphql.generated";
import { getPredefinedPageCodePath } from "@src/middleware/predefinedPages";
import { loadNewsDetail } from "@src/news/loadNewsDetail";
import { NewsArticleJsonLd } from "@src/news/NewsArticleJsonLd";
import { NewsDetail } from "@src/news/NewsDetail";
import { NewsPage } from "@src/news/NewsPage";
import { fetchNewsList } from "@src/news/NewsPage.loader";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { getSiteContext } from "@src/util/siteContext";
import { data, redirect } from "react-router";

import type { Route } from "./+types/DocumentPage";
import type { GQLDocumentTypeQuery, GQLDocumentTypeQueryVariables } from "./DocumentPage.generated";

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

function getRedirectDestination(target: RedirectsLinkBlockData): string | undefined {
    switch (target.block?.type) {
        case "internal": {
            const internalLink = target.block.props as InternalLinkBlockData;
            return internalLink.targetPage
                ? createSitePath({ path: internalLink.targetPage.path, scope: internalLink.targetPage.scope as GQLPageTreeNodeScope })
                : undefined;
        }
        case "external":
            return (target.block.props as ExternalLinkBlockData).targetUrl;
        case "news": {
            const newsLink = target.block.props as NewsLinkBlockData;
            return newsLink.news ? `/${newsLink.news.scope.language}/news/${newsLink.news.slug}` : undefined;
        }
        default:
            return undefined;
    }
}

async function loadDocument({ scope, path, graphQLFetch }: { scope: ContentScope; path: string; graphQLFetch: GraphQLFetch }) {
    const { siteConfig } = getSiteContext();
    // Redirects are scoped by domain only, not by language. If the language param isn't a valid language, it may still be the
    // first segment of a redirect source. In that case we skip resolving the page and only check if the path is a redirect source.
    const skipPage = !siteConfig.scope.languages.includes(scope.language);

    const { pageTreeNodeByPath, redirectBySource } = await graphQLFetch<GQLDocumentTypeQuery, GQLDocumentTypeQueryVariables>(documentTypeQuery, {
        skipPage,
        path,
        scope,
        redirectSource: `/${scope.language}${path !== "/" ? path : ""}`,
        redirectScope: { domain: scope.domain },
    });

    if (!pageTreeNodeByPath?.documentType) {
        const destination = redirectBySource?.target && getRedirectDestination(redirectBySource.target as RedirectsLinkBlockData);
        if (destination) {
            throw redirect(destination, 307);
        }
        throw data(null, { status: 404 });
    }

    const pageTreeNodeId = pageTreeNodeByPath.id;
    switch (pageTreeNodeByPath.documentType) {
        case "Page": {
            const metadata = await loadPageMetadata({ pageTreeNodeId, scope, graphQLFetch });
            if (!metadata) {
                throw data(null, { status: 404 });
            }
            return { type: "page" as const, scope, pageTreeNodeId, metadata, siteUrl: siteConfig.url };
        }
        case "Link": {
            const target = await getLinkTarget({ pageTreeNodeId, graphQLFetch });
            if (target) {
                throw redirect(target, 307);
            }
            throw data(null, { status: 404 });
        }
        default:
            throw new Error(`Unknown document type ${pageTreeNodeByPath.documentType}`);
    }
}

/**
 * The pages of the code below a predefined page of the page tree, e.g. the news below the path of the news page
 */
async function loadPredefinedPage({ codePath, scope, graphQLFetch }: { codePath: string; scope: ContentScope; graphQLFetch: GraphQLFetch }) {
    const [, , codePage, slug, ...rest] = codePath.split("/");
    if (codePage === "news" && slug === undefined) {
        return { type: "newsIndex" as const, scope, initialData: await fetchNewsList({ graphQLFetch, scope, limit: 2 }) };
    }
    if (codePage === "news" && slug && rest.length === 0) {
        return { type: "newsDetail" as const, scope, news: await loadNewsDetail({ scope, slug, graphQLFetch }) };
    }
    throw data(null, { status: 404 });
}

/**
 * The pages of the page tree, e.g. `/en/about/team` for the path `/about/team`, the counterpart of `[language]/[[...path]]/page.tsx`
 * of the Next.js site
 */
export async function loader({ request, params, context }: Route.LoaderArgs) {
    const scope = { domain: getSiteContext(context).domain, language: params.language };
    const graphQLFetch = createGraphQLFetch(context);

    const codePath = await getPredefinedPageCodePath(scope.domain, new URL(request.url).pathname);
    if (codePath) {
        return loadPredefinedPage({ codePath, scope, graphQLFetch });
    }

    // React Router has already decoded the path
    const path = `/${(params["*"] ?? "")
        .split("/")
        .filter((segment) => segment !== "")
        .join("/")}`;
    return loadDocument({ scope, path, graphQLFetch });
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
    switch (loaderData?.type) {
        case "page":
            return createMeta(loaderData.metadata, { baseUrl: loaderData.siteUrl });
        case "newsDetail":
            return [{ title: loaderData.news.title }];
        default:
            return [{ title: "Dextinity Demo Site" }];
    }
};

export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
    switch (loaderData.type) {
        case "page":
            return <Page pageTreeNodeId={loaderData.pageTreeNodeId} scope={loaderData.scope} />;
        case "newsIndex":
            return <NewsPage scope={loaderData.scope} initialData={loaderData.initialData} />;
        case "newsDetail":
            return (
                <>
                    <NewsArticleJsonLd news={loaderData.news} scope={loaderData.scope} />
                    <NewsDetail news={loaderData.news} />
                </>
            );
    }
}
