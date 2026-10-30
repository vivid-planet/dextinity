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
import { EmailCampaignMail } from "@src/brevo/EmailCampaignMail";
import { replaceMailHtmlPlaceholders } from "@src/brevo/util/replaceMailHtmlPlaceholders";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { PageContentBlock } from "@src/documents/pages/blocks/PageContentBlock";
import { StageBlock } from "@src/documents/pages/blocks/StageBlock";
import { FooterContentBlock } from "@src/layout/footer/blocks/FooterContentBlock";
import { RenderedMailForBlockPreview } from "@src/mail/components/RenderedMailForBlockPreview";
import type { ContentScope } from "@src/site-configs";
import { createBrowserGraphQLFetch } from "@src/util/browserGraphQLClient";
import { recursivelyLoadBlockData } from "@src/util/recursivelyLoadBlockData";
import { WelcomeEmailMail } from "@src/welcomeEmail/WelcomeEmailMail";

const replacePlaceholdersForPreview = (html: string) => replaceMailHtmlPlaceholders(html, "preview");

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
