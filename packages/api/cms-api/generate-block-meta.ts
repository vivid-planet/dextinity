import { promises as fs } from "fs";

import {
    AnchorBlock,
    createLinkBlock,
    createRichTextBlock,
    createSeoBlock,
    createTableBlock,
    createTextImageBlock,
    createTextLinkBlock,
    createTipTapRichTextBlock,
    DamFileDownloadLinkBlock,
    DamImageBlock,
    DamVideoBlock,
    EmailLinkBlock,
    ExternalLinkBlock,
    getBlocksMeta,
    InternalLinkBlock,
    PhoneLinkBlock,
    PixelImageBlock,
    SvgImageBlock,
    VimeoVideoBlock,
    YouTubeVideoBlock,
} from "./src";

async function generateBlockMeta(): Promise<void> {
    console.info("Generating block-meta.json...");

    const LinkBlock = createLinkBlock({
        supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock, email: EmailLinkBlock, phone: PhoneLinkBlock },
    });

    const RichTextBlock = createRichTextBlock({ link: LinkBlock });

    // The blocks client libraries generate their block types for. Blocks these reference are included automatically.
    const blocks = [
        AnchorBlock,
        DamFileDownloadLinkBlock,
        DamImageBlock,
        DamVideoBlock,
        LinkBlock,
        PixelImageBlock,
        RichTextBlock,
        SvgImageBlock,
        VimeoVideoBlock,
        YouTubeVideoBlock,
        createTextImageBlock({ text: RichTextBlock }),
        createTextLinkBlock({ link: LinkBlock }),
        createSeoBlock(),
        createTableBlock({ richText: RichTextBlock }),
        createTipTapRichTextBlock({ link: LinkBlock }),
    ];

    const metaJson = getBlocksMeta(blocks);
    await fs.writeFile("block-meta.json", JSON.stringify(metaJson, null, 4));

    console.info("Done!");
}

generateBlockMeta();
