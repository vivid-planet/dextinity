import {
    createLinkBlock,
    DamFileDownloadLinkBlock,
    EmailLinkBlock,
    ExternalLinkBlock,
    InternalLinkBlock,
    PhoneLinkBlock,
} from "@dextinity/cms-admin";
import { NewsLinkBlock } from "@src/news/blocks/NewsLinkBlock";
import { ProductLinkBlock } from "@src/products/blocks/ProductLinkBlock";
import { defineMessage } from "react-intl";

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
    tags: [
        defineMessage({ id: "linkBlock.tag.link", defaultMessage: "link" }),
        defineMessage({ id: "linkBlock.tag.button", defaultMessage: "Button" }),
        "coffee",
    ],
});
