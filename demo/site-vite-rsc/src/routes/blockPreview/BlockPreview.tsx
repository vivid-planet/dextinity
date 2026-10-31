"use client";

import { createFetchInMemoryCache } from "@dextinity/site-react";
import { createBlockPreview, defineBlockPreview } from "@dextinity/site-vite-rsc";
import type {
    AllBlockNames,
    EmailCampaignContentBlockData,
    FooterContentBlockData,
    PageContentBlockData,
    RichTextBlockData,
    StageBlockData,
    WelcomeEmailContentBlockData,
} from "@src/blocks.generated";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { PageContentBlock } from "@src/documents/pages/blocks/PageContentBlock";
import { StageBlock } from "@src/documents/pages/blocks/StageBlock";
import { FooterContentBlock } from "@src/layout/footer/blocks/FooterContentBlock";
import type { ContentScope } from "@src/site-configs";
import { createBrowserGraphQLFetch } from "@src/util/browserGraphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { lazy } from "react";

// Loaded on demand, as only the mail previews need the mail renderer
const WelcomeEmailPreview = lazy(async () => ({ default: (await import("./WelcomeEmailPreview")).WelcomeEmailPreview }));
const EmailCampaignPreview = lazy(async () => ({ default: (await import("./EmailCampaignPreview")).EmailCampaignPreview }));

const cachingFetch = createFetchInMemoryCache(fetch);

export const BlockPreview = createBlockPreview<AllBlockNames>({
    previews: {
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
            render: (data: WelcomeEmailContentBlockData) => <WelcomeEmailPreview data={data} />,
        }),
        "brevo-email-campaign": defineBlockPreview({
            blockType: "EmailCampaignContent",
            getBlock: (state: { content: unknown }) => state.content,
            render: (data: EmailCampaignContentBlockData) => <EmailCampaignPreview data={data} />,
        }),
    },
    loadBlockData: ({ blockType, block, contentScope }) =>
        recursivelyLoadBlockData({
            blockType,
            blockData: block,
            graphQLFetch: createBrowserGraphQLFetch({ fetch: cachingFetch }),
            fetch: cachingFetch,
            scope: contentScope as ContentScope,
        }),
});
