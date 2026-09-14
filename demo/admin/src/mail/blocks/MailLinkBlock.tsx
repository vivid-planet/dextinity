import { createLinkBlock, ExternalLinkBlock, PhoneLinkBlock } from "@dextinity/cms-admin";

export const MailLinkBlock = createLinkBlock({
    name: "MailLink",
    supportedBlocks: {
        external: ExternalLinkBlock,
        phone: PhoneLinkBlock,
    },
});
