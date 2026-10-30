"use client";

import { createFetchInMemoryCache, useIFrameBridge } from "@dextinity/site-react";
import type {
    AllBlockNames,
    EmailCampaignContentBlockData,
    FooterContentBlockData,
    PageContentBlockData,
    RichTextBlockData,
    StageBlockData,
    WelcomeEmailContentBlockData,
} from "@src/blocks.generated";
import { EmailCampaignMail } from "@src/brevo/EmailCampaignMail";
import { replaceMailHtmlPlaceholders } from "@src/brevo/util/replaceMailHtmlPlaceholders";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { PageContentBlock } from "@src/documents/pages/blocks/PageContentBlock";
import { StageBlock } from "@src/documents/pages/blocks/StageBlock";
import { FooterContentBlock } from "@src/layout/footer/blocks/FooterContentBlock";
import { RenderedMailForBlockPreview } from "@src/mail/components/RenderedMailForBlockPreview";
import type { ContentScope } from "@src/site-configs";
import { withBlockPreview } from "@src/util/blockPreview";
import { createBrowserGraphQLFetch } from "@src/util/browserGraphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { WelcomeEmailMail } from "@src/welcomeEmail/WelcomeEmailMail";
import { type ReactNode, useEffect, useState } from "react";

import type { BlockPreviewType } from "./blockPreviewTypes";

type BlockPreviewDefinition = {
    blockType: AllBlockNames;
    /** The block of `blockType` in the state sent by the admin, if the state isn't the block itself */
    getBlock?: (state: never) => unknown;
    render: (data: unknown) => ReactNode;
};

function defineBlockPreview<Data, State = unknown>(definition: {
    blockType: AllBlockNames;
    getBlock?: (state: State) => unknown;
    render: (data: Data) => ReactNode;
}) {
    return definition as BlockPreviewDefinition;
}

const replacePlaceholdersForPreview = (html: string) => replaceMailHtmlPlaceholders(html, "preview");

const blockPreviews: Record<BlockPreviewType, BlockPreviewDefinition> = {
    page: defineBlockPreview({
        blockType: "PageContent",
        render: (data: PageContentBlockData) => <PageContentBlock data={data} />,
    }),
    stage: defineBlockPreview({
        blockType: "Stage",
        render: (data: StageBlockData) => <StageBlock data={data} />,
    }),
    "main-menu": defineBlockPreview({
        blockType: "RichText",
        render: (data: RichTextBlockData) => <RichTextBlock data={data} />,
    }),
    footer: defineBlockPreview({
        blockType: "FooterContent",
        render: (data: FooterContentBlockData) => <FooterContentBlock data={data} />,
    }),
    "welcome-email": defineBlockPreview({
        blockType: "WelcomeEmailContent",
        render: (data: WelcomeEmailContentBlockData) => (
            <RenderedMailForBlockPreview mail={(props) => <WelcomeEmailMail content={data} {...props} />} />
        ),
    }),
    "brevo-email-campaign": defineBlockPreview({
        blockType: "EmailCampaignContent",
        getBlock: (state: { content: unknown }) => state.content,
        render: (data: EmailCampaignContentBlockData) => (
            <RenderedMailForBlockPreview
                mail={(props) => <EmailCampaignMail content={data} {...props} />}
                transformHtml={replacePlaceholdersForPreview}
            />
        ),
    }),
};

const cachingFetch = createFetchInMemoryCache(fetch);

function BlockPreviewContent({ type }: { type: BlockPreviewType }) {
    const iFrameBridge = useIFrameBridge();
    const [blockData, setBlockData] = useState<unknown>();

    useEffect(() => {
        async function load() {
            if (!iFrameBridge.block) {
                setBlockData(undefined);
                return;
            }
            const { blockType, getBlock } = blockPreviews[type];
            const graphQLFetch = createBrowserGraphQLFetch({ fetch: cachingFetch });
            setBlockData(
                await recursivelyLoadBlockData({
                    blockType,
                    blockData: getBlock ? getBlock(iFrameBridge.block as never) : iFrameBridge.block,
                    graphQLFetch,
                    fetch: cachingFetch,
                    scope: iFrameBridge.contentScope as ContentScope,
                }),
            );
        }
        load();
    }, [type, iFrameBridge.block, iFrameBridge.contentScope]);

    return blockData === undefined ? null : blockPreviews[type].render(blockData);
}

/**
 * Renders the block the admin sends through the iframe bridge, with the data of its loaders
 */
export const BlockPreview = withBlockPreview(BlockPreviewContent);
