import { generateImageUrl, gql, JsonLd } from "@dextinity/site-nextjs";
import { Breadcrumbs } from "@src/common/components/breadcrumbs/Breadcrumbs";
import { breadcrumbsFragment } from "@src/common/components/breadcrumbs/Breadcrumbs.fragment";
import type { GQLPageTreeNodeScopeInput } from "@src/graphql.generated";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import type { Thing, WithContext } from "schema-dts";

import { PageContentBlock } from "./blocks/PageContentBlock";
import { StageBlock } from "./blocks/StageBlock";
import type { GQLPageQuery, GQLPageQueryVariables } from "./Page.generated";

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

type Props = { pageTreeNodeId: string; scope: GQLPageTreeNodeScopeInput };

async function fetchData({ pageTreeNodeId, scope }: Props) {
    const graphQLFetch = createGraphQLFetch();

    const props = await graphQLFetch<GQLPageQuery, GQLPageQueryVariables>(
        pageQuery,
        {
            pageTreeNodeId,
        },
        { method: "GET" }, //for request memoization
    );

    if (!props.pageContent) {
        throw new Error("Could not load page content");
    }
    const document = props.pageContent.document;
    if (!document) {
        return null;
    }
    if (document.__typename != "Page") {
        throw new Error(`invalid document type, expected Page, got ${document.__typename}`);
    }

    return {
        ...props,
        pageContent: {
            ...props.pageContent,
            document,
        },
    };
}

export async function generateMetadata({ pageTreeNodeId, scope }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const data = await fetchData({ pageTreeNodeId, scope });
    const siteConfig = getSiteConfigForDomain(scope.domain);

    const document = data?.pageContent?.document;
    if (!document) {
        return {};
    }

    const siteUrl = siteConfig.url;
    const canonicalUrl = (document.seo.canonicalUrl || `${siteUrl}/${scope.language}${data.pageContent.path}`).replace(/\/$/, ""); // Remove trailing slash for "home"

    // TODO move into library
    return {
        title: document.seo.htmlTitle || data.pageContent.name,
        description: document.seo.metaDescription,
        openGraph: {
            title: document.seo.openGraphTitle,
            description: document.seo.openGraphDescription,
            type: "website",
            url: canonicalUrl,
            images: document.seo.openGraphImage.block?.urlTemplate
                ? generateImageUrl({ src: document.seo.openGraphImage.block?.urlTemplate, width: 1200 }, 1200 / 630)
                : undefined,
        },
        robots: {
            index: !document.seo.noIndex,
        },
        alternates: {
            canonical: canonicalUrl,
            languages: document.seo.alternativeLinks.reduce(
                (acc, link) => {
                    if (link.code && link.url) {
                        acc[link.code] = link.url;
                    }
                    return acc;
                },
                { [scope.language]: canonicalUrl } as Record<string, string>,
            ),
        },
    };
}

export async function Page({ pageTreeNodeId, scope }: { pageTreeNodeId: string; scope: GQLPageTreeNodeScopeInput }) {
    const graphQLFetch = createGraphQLFetch();

    const data = await fetchData({ pageTreeNodeId, scope });
    const document = data?.pageContent?.document;
    if (!document) {
        // no document attached to page
        notFound(); //no return needed
    }
    if (document.__typename != "Page") {
        throw new Error(`invalid document type`);
    }

    [document.content, document.seo, document.stage] = await Promise.all([
        recursivelyLoadBlockData({
            blockType: "PageContent",
            blockData: document.content,
            graphQLFetch,
            fetch,
            scope,
        }),
        recursivelyLoadBlockData({
            blockType: "Seo",
            blockData: document.seo,
            graphQLFetch,
            fetch,
            scope,
        }),
        recursivelyLoadBlockData({
            blockType: "Stage",
            blockData: document.stage,
            graphQLFetch,
            fetch,
            scope,
        }),
    ]);

    let structuredData: WithContext<Thing> | undefined;
    if (document.seo.structuredData && document.seo.structuredData.length > 0) {
        try {
            structuredData = JSON.parse(document.seo.structuredData) as WithContext<Thing>;
        } catch (error) {
            // CMS-supplied JSON-LD is invalid; skip emitting it rather than crashing the page.
            console.error(`Invalid JSON-LD in seo.structuredData for page ${data.pageContent.id}:`, error);
        }
    }

    return (
        <>
            {structuredData && <JsonLd<Thing> data={structuredData} />}
            <Breadcrumbs {...data.pageContent} scope={scope} />
            {/* ID is used for skip link */}
            <main id="mainContent">
                <StageBlock data={document.stage} />
                <PageContentBlock data={document.content} />
            </main>
        </>
    );
}
