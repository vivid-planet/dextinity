"use client";

import type { Config } from "@dextinity/mail-react";
import { createFetchInMemoryCache, useIFrameBridge } from "@dextinity/site-nextjs";
import type { WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { RenderedMailForBlockPreview } from "@src/mail/components/RenderedMailForBlockPreview";
import type { ContentScope } from "@src/site-configs";
import { withBlockPreview } from "@src/util/blockPreview";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { WelcomeEmailMail } from "@src/welcomeEmail/WelcomeEmailMail";
import { useEffect, useState } from "react";
import type { IntlConfig } from "react-intl";

const cachingFetch = createFetchInMemoryCache(fetch);

function isContentScope(value: unknown): value is ContentScope {
    return typeof value === "object" && value !== null && "domain" in value && "language" in value;
}

interface WelcomeEmailPreviewProps {
    language: string;
    messages: IntlConfig["messages"];
    config: Config;
}

function WelcomeEmailPreviewComponent({ language, messages, config }: WelcomeEmailPreviewProps) {
    const iFrameBridge = useIFrameBridge();
    const [blockData, setBlockData] = useState<WelcomeEmailContentBlockData>();

    const scope = isContentScope(iFrameBridge.contentScope) ? iFrameBridge.contentScope : undefined;

    useEffect(() => {
        async function load() {
            if (!iFrameBridge.block || !scope) {
                setBlockData(undefined);
                return;
            }
            const graphQLFetch = createGraphQLFetch({ fetch: cachingFetch });
            const newData = await recursivelyLoadBlockData({
                blockType: "WelcomeEmailContent",
                blockData: iFrameBridge.block,
                graphQLFetch,
                fetch: cachingFetch,
                scope,
            });
            setBlockData(newData);
        }
        load();
    }, [iFrameBridge.block, scope]);

    if (blockData === undefined) {
        return null;
    }

    return <RenderedMailForBlockPreview mail={<WelcomeEmailMail content={blockData} config={config} locale={language} messages={messages} />} />;
}

export const WelcomeEmailPreview = withBlockPreview(WelcomeEmailPreviewComponent);
