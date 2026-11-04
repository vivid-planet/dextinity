import { generateImageUrl, gql, JsonLd } from "@dextinity/site-react";
import { Metadata, notFound } from "@dextinity/site-vite-rsc";
import type { PageContentBlockData } from "@src/blocks.generated";
import { Breadcrumbs } from "@src/common/components/breadcrumbs/Breadcrumbs";
import { breadcrumbsFragment } from "@src/common/components/breadcrumbs/Breadcrumbs.fragment";
import type { GQLPageTreeNodeScopeInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { Suspense } from "react";
import type { Thing, WithContext } from "schema-dts";

import { PageContentBlock } from "./blocks/PageContentBlock";
import { StageBlock } from "./blocks/StageBlock";
import type { GQLPageQuery, GQLPageQueryVariables } from "./Page.generated";
import styles from "./Page.module.scss";

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
    const props = await graphQLFetch<GQLPageQuery, GQLPageQueryVariables>(
        pageQuery,
        {
            pageTreeNodeId,
        },
        { method: "GET" },
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

async function PageContent({ content, scope }: { content: PageContentBlockData; scope: GQLPageTreeNodeScopeInput }) {
    const loadedContent = await recursivelyLoadBlockData({ blockType: "PageContent", blockData: content, graphQLFetch, fetch, scope });
    return <PageContentBlock data={loadedContent} />;
}

export async function Page({ pageTreeNodeId, scope }: { pageTreeNodeId: string; scope: GQLPageTreeNodeScopeInput }) {
    const data = await fetchData({ pageTreeNodeId, scope });
    const document = data?.pageContent?.document;
    if (!document) {
        // no document attached to page
        notFound(); //no return needed
    }
    if (document.__typename != "Page") {
        throw new Error(`invalid document type`);
    }

    [document.seo, document.stage] = await Promise.all([
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

    const siteConfig = getSiteConfigForDomain(scope.domain);
    const canonicalUrl = (document.seo.canonicalUrl || `${siteConfig.url}/${scope.language}${data.pageContent.path}`).replace(/\/$/, ""); // Remove trailing slash for "home"
    const alternativeLinks = document.seo.alternativeLinks.filter((link): link is { code: string; url: string } => Boolean(link.code && link.url));
    const openGraphImageUrlTemplate = document.seo.openGraphImage.block?.urlTemplate;

    let structuredData: WithContext<Thing> | undefined;
    if (document.seo.structuredData && document.seo.structuredData.length > 0) {
        try {
            structuredData = JSON.parse(document.seo.structuredData) as WithContext<Thing>;
        } catch (error) {
            // CMS-supplied JSON-LD is invalid; skip emitting it rather than crashing the page.
            console.error(`Invalid JSON-LD in seo.structuredData for page ${data.pageContent.id}:`, error);
        }
    }

    // React hoists these elements into the <head>
    return (
        <>
            <title>{document.seo.htmlTitle || data.pageContent.name}</title>
            <Metadata
                baseUrl={siteConfig.url}
                description={document.seo.metaDescription}
                noIndex={document.seo.noIndex}
                canonicalUrl={canonicalUrl}
                alternateLinks={[
                    { hrefLang: scope.language, url: canonicalUrl },
                    ...alternativeLinks.map((link) => ({ hrefLang: link.code, url: link.url })),
                ]}
                openGraphTitle={document.seo.openGraphTitle}
                openGraphDescription={document.seo.openGraphDescription}
                openGraphImageUrl={openGraphImageUrlTemplate && generateImageUrl({ src: openGraphImageUrlTemplate, width: 1200 }, 1200 / 630)}
            />
            {structuredData && <JsonLd<Thing> data={structuredData} />}
            <Breadcrumbs {...data.pageContent} scope={scope} />
            {/* ID is used for skip link */}
            <main id="mainContent">
                <StageBlock data={document.stage} />
                {/* The loaders of the content blocks, e.g. news and products, may be slow, the stage is shown before them in streamed responses */}
                <Suspense fallback={<div className={styles.contentPlaceholder} />}>
                    <PageContent content={document.content} scope={scope} />
                </Suspense>
            </main>
        </>
    );
}
