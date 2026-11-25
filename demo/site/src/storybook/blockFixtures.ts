import type {
    CallToActionBlockData,
    CallToActionListBlockData,
    DamImageBlockData,
    HeadingBlockData,
    LinkBlockData,
    MediaBlockData,
    PixelImageBlockData,
    RichTextBlockData,
    SpaceBlockData,
    SvgImageBlockData,
    TextLinkBlockData,
    TipTapNode,
} from "@src/blocks.generated";

export const loremIpsum =
    "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.";

export function createParagraph(text: string, textBlockStyle?: string): TipTapNode {
    return { type: "textBlock", attrs: { textBlock: "paragraph", textBlockStyle }, content: [{ type: "text", text }] };
}

export function createRichTextHeading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 2, textBlockStyle?: string): TipTapNode {
    return { type: "textBlock", attrs: { textBlock: `heading-${level}`, textBlockStyle }, content: [{ type: "text", text }] };
}

export function createBulletList(...items: string[]): TipTapNode {
    return { type: "bulletList", content: items.map((text) => ({ type: "listItem", content: [createParagraph(text)] })) };
}

export function createOrderedList(...items: Array<string | TipTapNode>): TipTapNode {
    return {
        type: "orderedList",
        content: items.map((item) => ({ type: "listItem", content: [typeof item === "string" ? createParagraph(item) : item] })),
    };
}

export function createRichText(...content: Array<string | TipTapNode>): RichTextBlockData {
    return { tipTapContent: { type: "doc", content: content.map((node) => (typeof node === "string" ? createParagraph(node) : node)) } };
}

export const emptyRichText: RichTextBlockData = createRichText();

export function createExternalLink(targetUrl = "https://www.dextinity.com"): LinkBlockData {
    const props = { targetUrl, openInNewWindow: false, noFollow: false };
    return { attachedBlocks: [{ type: "external", props }], activeType: "external", block: { type: "external", props } };
}

export function createInternalLink(path = "/about-us"): LinkBlockData {
    const props = {
        targetPage: { id: "storybook-page", name: "About us", path, scope: { domain: "main", language: "en" }, documentType: "Page" },
    };
    return { attachedBlocks: [{ type: "internal", props }], activeType: "internal", block: { type: "internal", props } };
}

export function createTextLink(text: string, link: LinkBlockData = createExternalLink()): TextLinkBlockData {
    return { text, link };
}

// An existing public file, so the download works in Storybook.
export function createFileDownloadLink(): LinkBlockData {
    const props = {
        openFileType: "Download" as const,
        file: { id: "storybook-logo", name: "dextinity-logo.svg", fileUrl: "/assets/dextinity-logo.svg", size: 3953, mimetype: "image/svg+xml" },
    };
    return { attachedBlocks: [{ type: "damFileDownload", props }], activeType: "damFileDownload", block: { type: "damFileDownload", props } };
}

export const emptyLink: LinkBlockData = { attachedBlocks: [] };

// picsum.photos serves a stable image per seed in every size the `urlTemplate` asks for, so stories don't depend on the DAM.
export function createPixelImage({
    seed = "dextinity",
    width = 1920,
    height = 1080,
}: { seed?: string; width?: number; height?: number } = {}): PixelImageBlockData {
    return {
        damFile: {
            id: `storybook-${seed}`,
            name: `${seed}.jpg`,
            size: 250000,
            mimetype: "image/jpeg",
            contentHash: seed,
            archived: false,
            altText: "Example image",
            fileUrl: `https://picsum.photos/seed/${seed}/${width}/${height}`,
            image: { width, height, cropArea: { focalPoint: "SMART" }, dominantColor: "#a0a0a0" },
        },
        urlTemplate: `https://picsum.photos/seed/${seed}/$resizeWidth/$resizeHeight`,
    };
}

export function createDamImage(options?: Parameters<typeof createPixelImage>[0]): DamImageBlockData {
    const props = createPixelImage(options);
    return { attachedBlocks: [{ type: "pixelImage", props }], activeType: "pixelImage", block: { type: "pixelImage", props } };
}

export const emptyDamImage: DamImageBlockData = { attachedBlocks: [] };

function createSvgImage(fileUrl = "/assets/dextinity-logo.svg"): SvgImageBlockData {
    return {
        damFile: {
            id: "storybook-svg",
            name: "image.svg",
            size: 2000,
            mimetype: "image/svg+xml",
            contentHash: "svg",
            archived: false,
            fileUrl,
        },
    };
}

export function createSvgDamImage(fileUrl?: string): DamImageBlockData {
    const props = createSvgImage(fileUrl);
    return { attachedBlocks: [{ type: "svgImage", props }], activeType: "svgImage", block: { type: "svgImage", props } };
}

export function createImageMedia(options?: Parameters<typeof createPixelImage>[0]): MediaBlockData {
    const props = createDamImage(options);
    return { attachedBlocks: [{ type: "image", props }], activeType: "image", block: { type: "image", props } };
}

export function createYouTubeMedia(youtubeIdentifier = "M7lc1UVf-VE"): MediaBlockData {
    const props = { youtubeIdentifier, showControls: true, previewImage: createPixelImage({ seed: "youtube" }) };
    return { attachedBlocks: [{ type: "youTubeVideo", props }], activeType: "youTubeVideo", block: { type: "youTubeVideo", props } };
}

export const emptyMedia: MediaBlockData = { attachedBlocks: [] };

export function createHeading({
    headline,
    eyebrow,
    level = 2,
}: {
    headline: string;
    eyebrow?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}): HeadingBlockData {
    return {
        eyebrow: eyebrow ? createRichText(eyebrow) : emptyRichText,
        headline: createRichText(createRichTextHeading(headline, level)),
    };
}

export function createCallToActionList(
    ...callToActions: Array<{ text: string; variant: CallToActionBlockData["variant"]; link?: LinkBlockData }>
): CallToActionListBlockData {
    return {
        blocks: callToActions.map(({ text, variant, link }, index) => ({
            key: `callToAction${index}`,
            visible: true,
            props: { textLink: createTextLink(text, link), variant },
        })),
    };
}

export function createListItems<Props>(items: Props[], keyPrefix = "item"): Array<{ key: string; visible: boolean; props: Props }> {
    return items.map((props, index) => ({ key: `${keyPrefix}${index}`, visible: true, props }));
}

export function createBlocksItems<Props>(
    items: Array<{ type: string; props: Props }>,
): Array<{ key: string; visible: boolean; type: string; props: Props; userGroup: "all" }> {
    return items.map(({ type, props }, index) => ({ key: `${type}${index}`, visible: true, type, props, userGroup: "all" }));
}

// Two blocks named `Space` exist in the block meta, so the generated `SpaceBlockData` merges both. The site's space block only has `spacing`.
export function createSpace(spacing: SpaceBlockData["spacing"]): SpaceBlockData {
    return { spacing } as SpaceBlockData;
}
