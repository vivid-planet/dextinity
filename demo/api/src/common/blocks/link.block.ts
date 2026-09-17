import { createLinkBlock, DamFileDownloadLinkBlock, EmailLinkBlock, ExternalLinkBlock, InternalLinkBlock, PhoneLinkBlock } from "@dextinity/cms-api";
import { NewsLinkBlock } from "@src/news/blocks/news-link.block";
import { ProductLinkBlock } from "@src/products/blocks/product-link.block";

export const LinkBlock = createLinkBlock({
    supportedBlocks: {
        internal: InternalLinkBlock,
        external: ExternalLinkBlock,
        damFileDownload: DamFileDownloadLinkBlock,
        email: EmailLinkBlock,
        phone: PhoneLinkBlock,
        news: NewsLinkBlock,
        product: ProductLinkBlock,
    },
});
