"use client";

import { createFetchInMemoryCache, useIFrameBridge } from "@dextinity/site-nextjs";
import type { FooterContentBlockData } from "@src/blocks.generated";
import { FooterContentBlock } from "@src/layout/footer/blocks/FooterContentBlock";
import type { ContentScope } from "@src/site-configs";
import { withBlockPreview } from "@src/util/blockPreview";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { useEffect, useState } from "react";

const cachingFetch = createFetchInMemoryCache(fetch);

export default withBlockPreview(() => {
    const iFrameBridge = useIFrameBridge();

    const [blockData, setBlockData] = useState<FooterContentBlockData>();
    useEffect(() => {
        async function load() {
            if (!iFrameBridge.block) {
                setBlockData(undefined);
                return;
            }
            const graphQLFetch = createGraphQLFetch({ fetch: cachingFetch });
            const newData = await recursivelyLoadBlockData({
                blockType: "FooterContent",
                blockData: iFrameBridge.block,
                graphQLFetch,
                fetch: cachingFetch,
                scope: iFrameBridge.contentScope as ContentScope,
            });
            setBlockData(newData);
        }
        load();
    }, [iFrameBridge.block, iFrameBridge.contentScope]);

    return <div>{blockData && <FooterContentBlock data={blockData} />}</div>;
});
