import { JsonLd } from "@dextinity/site-react";
import { Breadcrumbs } from "@src/common/components/breadcrumbs/Breadcrumbs";
import type { GQLPageTreeNodeScopeInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import type { Thing, WithContext } from "schema-dts";

import { PageContentBlock } from "./blocks/PageContentBlock";
import { StageBlock } from "./blocks/StageBlock";
import { fetchPage } from "./loadPage";

/**
 * The content of a page, its metadata is set by the loader of the route with `loadPageMetadata()`
 */
export async function Page({ pageTreeNodeId, scope }: { pageTreeNodeId: string; scope: GQLPageTreeNodeScopeInput }) {
    const pageTreeNode = await fetchPage({ pageTreeNodeId, graphQLFetch });
    const { document } = pageTreeNode;

    const [content, stage] = await Promise.all([
        recursivelyLoadBlockData({ blockType: "PageContent", blockData: document.content, graphQLFetch, fetch, scope }),
        recursivelyLoadBlockData({ blockType: "Stage", blockData: document.stage, graphQLFetch, fetch, scope }),
    ]);

    let structuredData: WithContext<Thing> | undefined;
    if (document.seo.structuredData && document.seo.structuredData.length > 0) {
        try {
            structuredData = JSON.parse(document.seo.structuredData) as WithContext<Thing>;
        } catch (error) {
            // CMS-supplied JSON-LD is invalid; skip emitting it rather than crashing the page.
            console.error(`Invalid JSON-LD in seo.structuredData for page ${pageTreeNode.id}:`, error);
        }
    }

    return (
        <>
            {structuredData && <JsonLd<Thing> data={structuredData} />}
            <Breadcrumbs {...pageTreeNode} scope={scope} />
            {/* ID is used for skip link */}
            <main id="mainContent">
                <StageBlock data={stage} />
                <PageContentBlock data={content} />
            </main>
        </>
    );
}
