import { createRedirectsLinkBlock, createRedirectsPage } from "@dextinity/cms-admin";
import { NewsLinkBlock } from "@src/news/blocks/NewsLinkBlock";

export const RedirectsLinkBlock = createRedirectsLinkBlock({
    news: NewsLinkBlock,
});

export const RedirectsPage = createRedirectsPage({ linkBlock: RedirectsLinkBlock });
