import { createLinkBlock, ExternalLinkBlock, PhoneLinkBlock } from "@dextinity/cms-api";

export const MailLinkBlock = createLinkBlock(
    {
        supportedBlocks: {
            external: ExternalLinkBlock,
            phone: PhoneLinkBlock,
        },
    },
    "MailLink",
);
