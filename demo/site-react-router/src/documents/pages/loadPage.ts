import { generateImageUrl, gql, type GraphQLFetch } from "@dextinity/site-react";
import { createMetadata, notFound } from "@dextinity/site-react-router";
import { breadcrumbsFragment } from "@src/common/components/breadcrumbs/Breadcrumbs.fragment";
import type { GQLPageTreeNodeScopeInput } from "@src/graphql.generated";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { getSiteConfigForDomain } from "@src/util/siteConfig";

import type { GQLPageQuery, GQLPageQueryVariables } from "./loadPage.generated";

const pageQuery = gql`
    query Page($pageTreeNodeId: ID!) {
        pageContent: pageTreeNode(id: $pageTreeNodeId) {
            id
            name
            path
            document {
                __typename
                ... on Page {
                    content
                    seo
                    stage
                }
            }
            ...Breadcrumbs
        }
    }
    ${breadcrumbsFragment}
`;

/**
 * The page with its document, the server component of the page gets it from the same request without querying it again
 */
export async function fetchPage({ pageTreeNodeId, graphQLFetch }: { pageTreeNodeId: string; graphQLFetch: GraphQLFetch }) {
    const { pageContent } = await graphQLFetch<GQLPageQuery, GQLPageQueryVariables>(pageQuery, { pageTreeNodeId }, { method: "GET" });
    if (!pageContent) {
        throw new Error("Could not load page content");
    }
    const document = pageContent.document;
    if (!document) {
        // no document attached to page
        notFound();
    }
    if (document.__typename != "Page") {
        throw new Error(`invalid document type, expected Page, got ${document.__typename}`);
    }
    return { ...pageContent, document };
}

/**
 * The metadata of the page for the `meta` export, from its SEO block
 */
export async function loadPageMetadata({
    pageTreeNodeId,
    scope,
    graphQLFetch,
}: {
    pageTreeNodeId: string;
    scope: GQLPageTreeNodeScopeInput;
    graphQLFetch: GraphQLFetch;
}) {
    const pageTreeNode = await fetchPage({ pageTreeNodeId, graphQLFetch });
    const seo: typeof pageTreeNode.document.seo = await recursivelyLoadBlockData({
        blockType: "Seo",
        blockData: pageTreeNode.document.seo,
        graphQLFetch,
        fetch,
        scope,
    });

    const siteConfig = getSiteConfigForDomain(scope.domain);
    const canonicalUrl = (seo.canonicalUrl || `${siteConfig.url}/${scope.language}${pageTreeNode.path}`).replace(/\/$/, ""); // Remove trailing slash for "home"
    const alternativeLinks = seo.alternativeLinks.filter((link): link is { code: string; url: string } => Boolean(link.code && link.url));
    const openGraphImageUrlTemplate = seo.openGraphImage.block?.urlTemplate;

    return createMetadata({
        title: seo.htmlTitle || pageTreeNode.name,
        baseUrl: siteConfig.url,
        description: seo.metaDescription,
        noIndex: seo.noIndex,
        canonicalUrl,
        alternateLinks: [
            { hrefLang: scope.language, url: canonicalUrl },
            ...alternativeLinks.map((link) => ({ hrefLang: link.code, url: link.url })),
        ],
        openGraphTitle: seo.openGraphTitle,
        openGraphDescription: seo.openGraphDescription,
        openGraphImageUrl: openGraphImageUrlTemplate && generateImageUrl({ src: openGraphImageUrlTemplate, width: 1200 }, 1200 / 630),
    });
}
