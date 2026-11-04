import { generateImageUrl, gql, type GraphQLFetch } from "@dextinity/site-react";
import { createMetadata, notFound } from "@dextinity/site-react-router";
import { breadcrumbsFragment } from "@src/common/components/breadcrumbs/Breadcrumbs.fragment";
import type { GQLPageTreeNodeScopeInput } from "@src/graphql.generated";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { getSiteConfigForDomain } from "@src/util/siteConfig.server";

import type { GQLPageQuery, GQLPageQueryVariables } from "./loadPage.server.generated";

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

export async function loadPage({
    pageTreeNodeId,
    scope,
    graphQLFetch,
}: {
    pageTreeNodeId: string;
    scope: GQLPageTreeNodeScopeInput;
    graphQLFetch: GraphQLFetch;
}) {
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

    [document.content, document.seo, document.stage] = await Promise.all([
        recursivelyLoadBlockData({ blockType: "PageContent", blockData: document.content, graphQLFetch, fetch, scope }),
        recursivelyLoadBlockData({ blockType: "Seo", blockData: document.seo, graphQLFetch, fetch, scope }),
        recursivelyLoadBlockData({ blockType: "Stage", blockData: document.stage, graphQLFetch, fetch, scope }),
    ]);

    const { content, seo, stage } = document;
    const siteConfig = getSiteConfigForDomain(scope.domain);
    const canonicalUrl = (seo.canonicalUrl || `${siteConfig.url}/${scope.language}${pageContent.path}`).replace(/\/$/, ""); // Remove trailing slash for "home"
    const alternativeLinks = seo.alternativeLinks.filter((link): link is { code: string; url: string } => Boolean(link.code && link.url));
    const openGraphImageUrlTemplate = seo.openGraphImage.block?.urlTemplate;

    // Typed as JSON, the schema-dts types are too deep for the serialized types of the loader data
    let structuredData: Record<string, unknown> | undefined;
    if (seo.structuredData && seo.structuredData.length > 0) {
        try {
            structuredData = JSON.parse(seo.structuredData) as Record<string, unknown>;
        } catch (error) {
            // CMS-supplied JSON-LD is invalid; skip emitting it rather than crashing the page.
            console.error(`Invalid JSON-LD in seo.structuredData for page ${pageContent.id}:`, error);
        }
    }

    return {
        metadata: createMetadata({
            title: seo.htmlTitle || pageContent.name,
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
        }),
        structuredData,
        pageTreeNode: pageContent,
        scope,
        content,
        stage,
    };
}

export type PageData = Awaited<ReturnType<typeof loadPage>>;
