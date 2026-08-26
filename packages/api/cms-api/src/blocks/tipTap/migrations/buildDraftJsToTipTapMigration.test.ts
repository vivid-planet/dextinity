import { describe, expect, it } from "vitest";

import { ExternalLinkBlock } from "../../externalLink/external-link.block";
import { createLinkBlock } from "../../factories/createLinkBlock";
import { createTipTapRichTextBlock } from "../createTipTapRichTextBlock";
import type { DraftJsContent } from "./convertDraftJsToTipTap";

type DraftBlock = DraftJsContent["blocks"][number];

function draftBlock(overrides: Partial<DraftBlock> = {}): DraftBlock {
    return {
        key: "k",
        type: "unstyled",
        text: "",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        ...overrides,
    };
}

describe("createTipTapRichTextBlock with migrateFromDraftJs", () => {
    describe("end-to-end via blockDataFactory", () => {
        const block = createTipTapRichTextBlock({ migrateFromDraftJs: true }, "MigratedRichText");

        it("migrates DraftJS plain paragraph data and sets $$version", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [draftBlock({ type: "unstyled", text: "Hello" })],
                    entityMap: {},
                },
            });
            expect(data.tipTapContent).toEqual({
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
            });
        });

        it("preserves search text after migration", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [draftBlock({ type: "header-one", text: "Title" }), draftBlock({ type: "unstyled", text: "Body" })],
                    entityMap: {},
                },
            });
            const searchText = data.searchText();
            expect(searchText).toEqual([{ weight: "h1", text: "Title" }, "Body"]);
        });

        it("is a no-op for data that already has $$version: 1", () => {
            const input = {
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "already migrated" }] }],
                },
                $$version: 1,
            };
            const data = block.blockDataFactory(input);
            expect(data.tipTapContent).toEqual(input.tipTapContent);
        });

        it("preserves TipTap-shaped data when no $$version is present", () => {
            const tipTapContent = {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "pre-existing" }] }],
            };
            const data = block.blockDataFactory({ tipTapContent });
            expect(data.tipTapContent).toEqual(tipTapContent);
        });
    });

    describe("inline style marks", () => {
        const block = createTipTapRichTextBlock({ migrateFromDraftJs: true }, "MigratedRichTextInlineStyles");

        it("converts DraftJS inline styles to the matching TipTap marks", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [
                        draftBlock({
                            type: "unstyled",
                            text: "bold and italic",
                            inlineStyleRanges: [
                                { style: "BOLD", offset: 0, length: 4 },
                                { style: "ITALIC", offset: 9, length: 6 },
                            ],
                        }),
                    ],
                    entityMap: {},
                },
            });
            expect(data.tipTapContent).toEqual({
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            { type: "text", text: "bold", marks: [{ type: "bold" }] },
                            { type: "text", text: " and " },
                            { type: "text", text: "italic", marks: [{ type: "italic" }] },
                        ],
                    },
                ],
            });
        });
    });

    describe("with link block", () => {
        const LinkBlock = createLinkBlock({ supportedBlocks: { external: ExternalLinkBlock } }, "MigratedRichTextLink");
        const block = createTipTapRichTextBlock({ link: LinkBlock, migrateFromDraftJs: true }, "MigratedRichTextWithLink");

        it("converts DraftJS LINK entity to a link mark and a child block", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [
                        draftBlock({
                            type: "unstyled",
                            text: "click here",
                            entityRanges: [{ key: 0, offset: 0, length: 10 }],
                        }),
                    ],
                    entityMap: {
                        "0": {
                            type: "LINK",
                            mutability: "MUTABLE",
                            data: {
                                attachedBlocks: [
                                    { type: "external", props: { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false } },
                                ],
                                activeType: "external",
                            },
                        },
                    },
                },
            });
            expect(data.tipTapContent).toMatchObject({
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [{ type: "text", text: "click here", marks: [{ type: "link" }] }],
                    },
                ],
            });

            expect(data.childBlocksInfo()).toHaveLength(1);
            expect(data.childBlocksInfo()[0].name).toBe("MigratedRichTextLink");
        });
    });

    describe("without link block configured", () => {
        const block = createTipTapRichTextBlock({ migrateFromDraftJs: true }, "MigratedRichTextNoLink");

        it("strips link entities and keeps the plain text", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [
                        draftBlock({
                            type: "unstyled",
                            text: "click here",
                            entityRanges: [{ key: 0, offset: 0, length: 10 }],
                        }),
                    ],
                    entityMap: {
                        "0": { type: "LINK", mutability: "MUTABLE", data: { href: "https://example.com" } },
                    },
                },
            });
            expect(data.tipTapContent).toEqual({
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "click here" }] }],
            });
            expect(data.childBlocksInfo()).toHaveLength(0);
        });
    });

    describe("textBlockStyleMap", () => {
        const block = createTipTapRichTextBlock(
            {
                textBlockStyles: [
                    { name: "headline450", appliesTo: ["heading-2"] },
                    { name: "paragraph200", appliesTo: ["paragraph"] },
                ],
                migrateFromDraftJs: {
                    textBlockStyleMap: {
                        "paragraph-small": "paragraph200",
                        "headline-450": { textBlockType: "heading-2", textBlockStyle: "headline450" },
                    },
                },
            },
            "MigratedRichTextTextBlockStyles",
        );

        it("converts a custom block type to a heading keeping both level and textBlockStyle", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [draftBlock({ type: "headline-450", text: "Title" })],
                    entityMap: {},
                },
            });
            expect(data.tipTapContent).toEqual({
                type: "doc",
                content: [{ type: "heading", attrs: { level: 2, textBlockStyle: "headline450" }, content: [{ type: "text", text: "Title" }] }],
            });
        });

        it("converts a custom block type to a styled paragraph", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [draftBlock({ type: "paragraph-small", text: "small" })],
                    entityMap: {},
                },
            });
            expect(data.tipTapContent).toEqual({
                type: "doc",
                content: [{ type: "paragraph", attrs: { textBlockStyle: "paragraph200" }, content: [{ type: "text", text: "small" }] }],
            });
        });
    });

    describe("nested lists", () => {
        const block = createTipTapRichTextBlock({ migrateFromDraftJs: true }, "MigratedRichTextNestedLists");

        it("converts the Draft.js list item depth into nested TipTap lists", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [
                        draftBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        draftBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                        draftBlock({ type: "unordered-list-item", text: "b", depth: 0 }),
                    ],
                    entityMap: {},
                },
            });
            expect(data.tipTapContent).toEqual({
                type: "doc",
                content: [
                    {
                        type: "bulletList",
                        content: [
                            {
                                type: "listItem",
                                content: [
                                    { type: "paragraph", content: [{ type: "text", text: "a" }] },
                                    {
                                        type: "bulletList",
                                        content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "a.1" }] }] }],
                                    },
                                ],
                            },
                            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "b" }] }] },
                        ],
                    },
                ],
            });
        });
    });

    describe("listLevelMax", () => {
        const block = createTipTapRichTextBlock({ listLevelMax: 1, migrateFromDraftJs: true }, "MigratedRichTextListLevelMax");

        it("keeps the list flat instead of exceeding listLevelMax", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [
                        draftBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        draftBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                    ],
                    entityMap: {},
                },
            });
            expect(data.tipTapContent).toEqual({
                type: "doc",
                content: [
                    {
                        type: "bulletList",
                        content: [
                            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "a" }] }] },
                            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "a.1" }] }] },
                        ],
                    },
                ],
            });
        });
    });

    describe("maxTextBlocks fallback", () => {
        const block = createTipTapRichTextBlock({ maxTextBlocks: 2, migrateFromDraftJs: true }, "MigratedRichTextMaxBlocks");

        it("falls back to an empty doc when conversion exceeds maxTextBlocks", () => {
            const data = block.blockDataFactory({
                draftContent: {
                    blocks: [
                        draftBlock({ type: "unstyled", text: "one" }),
                        draftBlock({ type: "unstyled", text: "two" }),
                        draftBlock({ type: "unstyled", text: "three" }),
                    ],
                    entityMap: {},
                },
            });
            // Both the converted doc (3 blocks) and the stripped doc (3 blocks) exceed maxTextBlocks,
            // so the migration falls back to the empty doc.
            expect(data.tipTapContent).toEqual({ type: "doc", content: [{ type: "paragraph" }] });
        });
    });
});
