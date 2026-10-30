"use client";

import type { Config } from "@dextinity/mail-react";
import { createFetchInMemoryCache, useIFrameBridge } from "@dextinity/site-nextjs";
import type { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { EmailCampaignMail } from "@src/brevo/EmailCampaignMail";
import { replaceMailHtmlPlaceholders } from "@src/brevo/util/replaceMailHtmlPlaceholders";
import { RenderedMailForBlockPreview } from "@src/mail/components/RenderedMailForBlockPreview";
import type { ContentScope } from "@src/site-configs";
import { withBlockPreview } from "@src/util/blockPreview";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { useEffect, useState } from "react";
import type { IntlConfig } from "react-intl";

const cachingFetch = createFetchInMemoryCache(fetch);

const replacePlaceholdersForPreview = (html: string) => replaceMailHtmlPlaceholders(html, "preview");

interface BrevoEmailCampaignPreviewProps {
    language: string;
    messages: IntlConfig["messages"];
    config: Config;
}

function BrevoEmailCampaignPreviewComponent({ language, messages, config }: BrevoEmailCampaignPreviewProps) {
    const iFrameBridge = useIFrameBridge();
    const [blockData, setBlockData] = useState<EmailCampaignContentBlockData>();

    useEffect(() => {
        async function load() {
            if (!iFrameBridge.block) {
                setBlockData(undefined);
                return;
            }
            const graphQLFetch = createGraphQLFetch({ fetch: cachingFetch });
            const newData = await recursivelyLoadBlockData({
                blockType: "EmailCampaignContent",
                blockData: iFrameBridge.block,
                graphQLFetch,
                fetch: cachingFetch,
                scope: iFrameBridge.contentScope as ContentScope,
            });

            setBlockData(newData.content);
        }
        load();
    }, [iFrameBridge.block, iFrameBridge.contentScope]);

    if (blockData === undefined) {
        return null;
    }

    return (
        <RenderedMailForBlockPreview
            mail={<EmailCampaignMail content={blockData} config={config} locale={language} messages={messages} />}
            transformHtml={replacePlaceholdersForPreview}
        />
    );
}

export const BrevoEmailCampaignPreview = withBlockPreview(BrevoEmailCampaignPreviewComponent);
