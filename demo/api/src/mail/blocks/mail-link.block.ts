import { createLinkBlock, ExternalLinkBlock, PhoneLinkBlock } from "@dextinity/cms-api";

export const MailLinkBlock = createLinkBlock(
    {
        supportedBlocks: {
            external: ExternalLinkBlock,
            phone: PhoneLinkBlock,
        },
    },
    { name: "MailLink", description: "A link in an email, either to an external URL or to a phone number." },
);
