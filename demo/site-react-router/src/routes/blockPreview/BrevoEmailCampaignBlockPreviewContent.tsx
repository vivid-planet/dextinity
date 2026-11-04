"use client";

import type { Config } from "@dextinity/mail-react";
import { createFetchInMemoryCache, useIFrameBridge } from "@dextinity/site-react-router";
import type { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { EmailCampaignMail } from "@src/brevo/EmailCampaignMail";
import { replaceMailHtmlPlaceholders } from "@src/brevo/util/replaceMailHtmlPlaceholders";
import { RenderedMailForBlockPreview } from "@src/mail/components/RenderedMailForBlockPreview";
import type { ContentScope } from "@src/site-configs";
import { withBlockPreview } from "@src/util/blockPreview";
import { createBrowserGraphQLFetch } from "@src/util/browserGraphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

const cachingFetch = createFetchInMemoryCache(fetch);

const replacePlaceholdersForPreview = (html: string) => replaceMailHtmlPlaceholders(html, "preview");

function BrevoEmailCampaignBlockPreviewComponent({ config }: { config: Config }) {
    const iFrameBridge = useIFrameBridge();
    const { locale, messages } = useIntl();
    const [blockData, setBlockData] = useState<EmailCampaignContentBlockData>();

    useEffect(() => {
        async function load() {
            if (!iFrameBridge.block) {
                setBlockData(undefined);
                return;
            }
            const graphQLFetch = createBrowserGraphQLFetch({ fetch: cachingFetch });
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
            mail={<EmailCampaignMail content={blockData} config={config} locale={locale} messages={messages} />}
            transformHtml={replacePlaceholdersForPreview}
        />
    );
}

export const BrevoEmailCampaignBlockPreviewContent = withBlockPreview(BrevoEmailCampaignBlockPreviewComponent);
