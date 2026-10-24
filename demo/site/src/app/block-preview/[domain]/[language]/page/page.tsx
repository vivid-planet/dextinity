"use client";

import { createFetchInMemoryCache, useIFrameBridge } from "@dextinity/site-react";
import type { PageContentBlockData } from "@src/blocks.generated";
import { PageContentBlock } from "@src/documents/pages/blocks/PageContentBlock";
import type { ContentScope } from "@src/site-configs";
import { withBlockPreview } from "@src/util/blockPreview";
import { createBrowserGraphQLFetch } from "@src/util/browserGraphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { useEffect, useState } from "react";

const cachingFetch = createFetchInMemoryCache(fetch);

export default withBlockPreview(() => {
    const iFrameBridge = useIFrameBridge();

    const [blockData, setBlockData] = useState<PageContentBlockData>();
    useEffect(() => {
        async function load() {
            if (!iFrameBridge.block) {
                setBlockData(undefined);
                return;
            }
            const graphQLFetch = createBrowserGraphQLFetch({ fetch: cachingFetch });
            const newData = await recursivelyLoadBlockData({
                blockType: "PageContent",
                blockData: iFrameBridge.block,
                graphQLFetch,
                fetch: cachingFetch,
                scope: iFrameBridge.contentScope as ContentScope,
            });
            setBlockData(newData);
        }
        load();
    }, [iFrameBridge.block, iFrameBridge.contentScope]);

    return <div>{blockData && <PageContentBlock data={blockData} />}</div>;
});
