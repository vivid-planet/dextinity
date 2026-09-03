import { promises as fs } from "fs";

import {
    createLinkBlock,
    createRichTextBlock,
    createSeoBlock,
    createTableBlock,
    createTextImageBlock,
    createTextLinkBlock,
    createTipTapRichTextBlock,
    EmailLinkBlock,
    ExternalLinkBlock,
    getBlocksMeta,
    InternalLinkBlock,
    PhoneLinkBlock,
} from "./src";

async function generateBlockMeta(): Promise<void> {
    console.info("Generating block-meta.json...");

    const LinkBlock = createLinkBlock({
        supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock, email: EmailLinkBlock, phone: PhoneLinkBlock },
    });

    const RichTextBlock = createRichTextBlock({ link: LinkBlock });

    // Create TextImageBlock for block types generation in client libraries
    createTextImageBlock({ text: RichTextBlock });

    // Create TextLinkBlock for block types generation in client libraries
    createTextLinkBlock({ link: LinkBlock });

    // Create SeoBlock for block types generation in client libraries
    createSeoBlock();

    // Create TableBlock for block types generation in client libraries
    createTableBlock({ richText: RichTextBlock });

    // Create TipTapRichTextBlock for block types generation in client libraries
    createTipTapRichTextBlock({ link: { block: LinkBlock } });

    const metaJson = getBlocksMeta();
    await fs.writeFile("block-meta.json", JSON.stringify(metaJson, null, 4));

    console.info("Done!");
}

generateBlockMeta();
