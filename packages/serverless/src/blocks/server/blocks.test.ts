import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createBlock } from "./block.js";
import { AnchorBlock } from "./blocks/anchor-block.js";
import { ExternalLinkBlock } from "./blocks/link-blocks.js";
import { createBlocksBlock } from "./factories/create-blocks-block.js";
import { createColumnsBlock } from "./factories/create-columns-block.js";
import { createLinkBlock } from "./factories/create-link-block.js";
import { createOneOfBlock } from "./factories/create-one-of-block.js";
import { createRichTextBlock } from "./factories/create-rich-text-block.js";
import { createVimeoVideoBlock, createYouTubeVideoBlock } from "./factories/create-video-blocks.js";

const LinkBlock = createLinkBlock({ supportedBlocks: { external: ExternalLinkBlock } });
const RichTextBlock = createRichTextBlock({ link: LinkBlock });
const ContentBlock = createBlocksBlock({ name: "Content", supportedBlocks: { anchor: AnchorBlock, richtext: RichTextBlock } });
const ImageBlock = createBlock("Image", z.strictObject({ damFileId: z.uuid().optional() }));

const externalLink = (targetUrl: string) => ({
    attachedBlocks: [{ type: "external", props: { targetUrl, openInNewWindow: false, noFollow: false } }],
    activeType: "external",
});

describe("blocks", () => {
    it("accepts the output of the admin", () => {
        const input = {
            blocks: [
                { key: "a", visible: true, type: "anchor", props: { name: "top" } },
                {
                    key: "b",
                    visible: false,
                    type: "richtext",
                    props: {
                        draftContent: {
                            blocks: [
                                {
                                    key: "x",
                                    type: "unstyled",
                                    text: "Hello",
                                    depth: 0,
                                    inlineStyleRanges: [],
                                    entityRanges: [{ key: 0, offset: 0, length: 5 }],
                                },
                            ],
                            entityMap: {
                                0: { type: "LINK", mutability: "MUTABLE", data: { ...externalLink("https://example.com"), title: "Example" } },
                            },
                        },
                    },
                },
            ],
        };

        expect(ContentBlock.schema.parse(input)).toEqual(input);
    });

    it("rejects unknown block types and fields instead of dropping them", () => {
        expect(ContentBlock.schema.safeParse({ blocks: [{ key: "a", visible: true, type: "unknown", props: {} }] }).success).toBe(false);
        expect(
            ContentBlock.schema.safeParse({ blocks: [{ key: "a", visible: true, type: "anchor", props: { name: "top", color: "red" } }] }).success,
        ).toBe(false);
    });

    it("validates link targets like the NestJS API", () => {
        const isValid = (targetUrl: string) => LinkBlock.schema.safeParse(externalLink(targetUrl)).success;

        expect(isValid("https://example.com/path?query")).toBe(true);
        expect(isValid("mailto:office@example.com")).toBe(true);
        expect(isValid("tel:+43 123 456")).toBe(true);
        expect(isValid("javascript:alert(1)")).toBe(false);
        expect(isValid("https://example.com/?redirect=data:text/html")).toBe(false);
        expect(isValid("mailto:office")).toBe(false);
        expect(isValid("example.com")).toBe(false);
    });

    it("requires the active block of a one-of block to be attached", () => {
        const MediaBlock = createOneOfBlock({ name: "Media", supportedBlocks: { image: ImageBlock, anchor: AnchorBlock }, allowEmpty: false });

        expect(MediaBlock.schema.safeParse({ attachedBlocks: [{ type: "image", props: {} }], activeType: "image" }).success).toBe(true);
        expect(MediaBlock.schema.safeParse({ attachedBlocks: [{ type: "image", props: {} }], activeType: "anchor" }).success).toBe(false);
        expect(MediaBlock.schema.safeParse({ attachedBlocks: [] }).success).toBe(false);
    });

    it("requires as many columns as the layout has", () => {
        const ColumnsBlock = createColumnsBlock({
            name: "Columns",
            layouts: [
                { name: "9-9", columns: 2 },
                { name: "18", columns: 1 },
            ],
            contentBlock: ContentBlock,
        });
        const column = () => ({ key: crypto.randomUUID(), visible: true, props: { blocks: [] } });

        expect(ColumnsBlock.schema.safeParse({ layout: "9-9", columns: [column(), column()] }).success).toBe(true);
        expect(ColumnsBlock.schema.safeParse({ layout: "9-9", columns: [column()] }).success).toBe(false);
    });

    it("validates video identifiers", () => {
        const YouTubeVideoBlock = createYouTubeVideoBlock({ previewImage: ImageBlock });
        const VimeoVideoBlock = createVimeoVideoBlock({ previewImage: ImageBlock });

        expect(YouTubeVideoBlock.schema.safeParse({ youtubeIdentifier: "dQw4w9WgXcQ", previewImage: {} }).success).toBe(true);
        expect(YouTubeVideoBlock.schema.safeParse({ youtubeIdentifier: "https://youtu.be/dQw4w9WgXcQ", previewImage: {} }).success).toBe(true);
        expect(YouTubeVideoBlock.schema.safeParse({ youtubeIdentifier: "dQw4w9", previewImage: {} }).success).toBe(false);
        expect(VimeoVideoBlock.schema.safeParse({ vimeoIdentifier: "https://vimeo.com/76979871", previewImage: {} }).success).toBe(true);
        expect(VimeoVideoBlock.schema.safeParse({ vimeoIdentifier: "abc", previewImage: {} }).success).toBe(false);
    });
});
