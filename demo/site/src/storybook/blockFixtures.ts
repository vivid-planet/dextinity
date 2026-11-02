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
    TipTapRichTextBlockData,
} from "@src/blocks.generated";

interface DraftInlineStyleRange {
    offset: number;
    length: number;
    style: "BOLD" | "ITALIC" | "SUB" | "SUP" | "STRIKETHROUGH";
}

interface DraftParagraph {
    text: string;
    type?:
        | "unstyled"
        | "paragraph-standard"
        | "paragraph-small"
        | "header-one"
        | "header-two"
        | "header-three"
        | "header-four"
        | "header-five"
        | "header-six"
        | "unordered-list-item"
        | "ordered-list-item";
    depth?: number;
    inlineStyleRanges?: DraftInlineStyleRange[];
    link?: { offset: number; length: number; data: LinkBlockData };
}

export const loremIpsum =
    "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.";

export function createRichText(...paragraphs: Array<string | DraftParagraph>): RichTextBlockData {
    const entityMap: Record<string, { type: "LINK"; mutability: "MUTABLE"; data: LinkBlockData }> = {};

    const blocks = paragraphs.map((paragraph, index) => {
        const {
            text,
            type = "paragraph-standard",
            depth = 0,
            inlineStyleRanges = [],
            link,
        } = typeof paragraph === "string" ? { text: paragraph } : paragraph;

        const entityRanges = [];
        if (link) {
            const entityKey = Object.keys(entityMap).length;
            entityMap[entityKey] = { type: "LINK", mutability: "MUTABLE", data: link.data };
            entityRanges.push({ offset: link.offset, length: link.length, key: entityKey });
        }

        return { key: `block${index}`, text, type, depth, inlineStyleRanges, entityRanges, data: {} };
    });

    return { draftContent: { blocks, entityMap } };
}

export const emptyRichText: RichTextBlockData = createRichText();

export function createTipTapRichText(...content: TipTapNode[]): TipTapRichTextBlockData {
    return { tipTapContent: { type: "doc", content } };
}

export function createTipTapParagraph(text: string, textBlockStyle?: string): TipTapNode {
    return { type: "textBlock", attrs: { textBlock: "paragraph", textBlockStyle }, content: [{ type: "text", text }] };
}

export function createTipTapHeading(text: string, level: 1 | 2 | 3 | 4 | 5 = 2): TipTapNode {
    return { type: "textBlock", attrs: { textBlock: `heading-${level}` }, content: [{ type: "text", text }] };
}

export function createTipTapBulletList(...items: string[]): TipTapNode {
    return {
        type: "bulletList",
        content: items.map((text) => ({ type: "listItem", content: [createTipTapParagraph(text)] })),
    };
}

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
    htmlTag = "h2",
}: {
    headline: string;
    eyebrow?: string;
    htmlTag?: HeadingBlockData["htmlTag"];
}): HeadingBlockData {
    return {
        eyebrow: eyebrow ? createRichText({ text: eyebrow, type: "unstyled" }) : emptyRichText,
        headline: createRichText({ text: headline, type: "header-two" }),
        htmlTag,
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
