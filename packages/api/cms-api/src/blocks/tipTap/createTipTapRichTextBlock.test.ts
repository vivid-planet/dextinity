import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { createLinkBlock } from "../factories/createLinkBlock";
import {
    createTipTapRichTextBlock,
    type TipTapRichTextBlockContent,
    type TipTapRichTextBlockDataInterface,
    type TipTapRichTextBlockInputInterface,
} from "./createTipTapRichTextBlock";

describe("createTipTapRichTextBlock validation", () => {
    describe("default schema (default supports)", () => {
        const block = createTipTapRichTextBlock({}, "TestDefault");

        it("should accept a valid empty document", async () => {
            const input = block.blockInputFactory({
                tipTapContent: { type: "doc", content: [{ type: "paragraph" }] },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept a paragraph with text", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Hello world" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept bold text", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "bold" }], text: "Bold text" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept italic and strike marks", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "italic" }, { type: "strike" }], text: "Styled" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject underline marks (not in default supports)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "underline" }], text: "Underlined" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should accept headings", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Title" }] },
                        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Subtitle" }] },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept ordered and bullet lists", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "orderedList",
                            content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "One" }] }] }],
                        },
                        {
                            type: "bulletList",
                            content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Bullet" }] }] }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept superscript and subscript marks", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", marks: [{ type: "superscript" }], text: "sup" },
                                { type: "text", marks: [{ type: "subscript" }], text: "sub" },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept nonBreakingSpace and softHyphen nodes", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", text: "before" },
                                { type: "nonBreakingSpace" },
                                { type: "text", text: "after" },
                                { type: "softHyphen" },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject an unknown node type", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "unknownBlock", content: [{ type: "text", text: "test" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe("tipTapContent");
        });

        it("should reject an unknown mark type", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "highlight" }], text: "test" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject a blockquote (disabled in config)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "blockquote",
                            content: [{ type: "paragraph", content: [{ type: "text", text: "quoted" }] }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject a codeBlock (disabled in config)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "codeBlock", content: [{ type: "text", text: "code" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject null content", async () => {
            // Cast required because the typed input rejects invalid content at compile time; here we test the runtime guard.
            const input = block.blockInputFactory({ tipTapContent: null as unknown as TipTapRichTextBlockContent });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject a string instead of object", async () => {
            // Cast required because the typed input rejects invalid content at compile time; here we test the runtime guard.
            const input = block.blockInputFactory({ tipTapContent: "not an object" as unknown as TipTapRichTextBlockContent });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject an empty object", async () => {
            const input = block.blockInputFactory({ tipTapContent: {} });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });
    });

    describe("bold-only schema", () => {
        const block = createTipTapRichTextBlock({ supports: ["bold"] }, "TestBoldOnly");

        it("should accept bold text", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "bold" }], text: "Bold" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject italic (not in supports)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "italic" }], text: "Italic" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject underline (not in supports)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "underline" }], text: "Underlined" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject headings (not in supports)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Title" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject ordered lists (not in supports)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "orderedList",
                            content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "One" }] }] }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject nonBreakingSpace (not in supports)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "nonBreakingSpace" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });
    });

    describe("schema with underline support", () => {
        const block = createTipTapRichTextBlock({ supports: ["underline"] }, "TestUnderline");

        it("should accept underline marks", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "underline" }], text: "Underlined" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });
    });

    describe("schema with text block styles", () => {
        const block = createTipTapRichTextBlock(
            {
                supports: ["bold", "heading"],
                textBlockStyles: [{ name: "intro", appliesTo: ["paragraph"] }, { name: "highlight" }],
            },
            "TestBlockStyles",
        );

        it("should accept a paragraph with textBlockStyle attribute", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            attrs: { textBlockStyle: "intro" },
                            content: [{ type: "text", text: "Intro text" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept a heading with textBlockStyle attribute", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "heading",
                            attrs: { level: 1, textBlockStyle: "highlight" },
                            content: [{ type: "text", text: "Highlighted heading" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept a paragraph with null textBlockStyle", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            attrs: { textBlockStyle: null },
                            content: [{ type: "text", text: "Default" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });
    });

    describe("schema with text block styles and lists", () => {
        const block = createTipTapRichTextBlock(
            {
                supports: ["bold", "heading", "ordered-list", "unordered-list"],
                textBlockStyles: [
                    { name: "intro", appliesTo: ["paragraph"] },
                    { name: "listStyle", appliesTo: ["ordered-list", "unordered-list"] },
                    { name: "highlight" },
                ],
            },
            "TestBlockStylesList",
        );

        it("should accept a paragraph with textBlockStyle inside an ordered list", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "orderedList",
                            content: [
                                {
                                    type: "listItem",
                                    content: [
                                        {
                                            type: "paragraph",
                                            attrs: { textBlockStyle: "listStyle" },
                                            content: [{ type: "text", text: "Styled list item" }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept a paragraph with textBlockStyle inside a bullet list", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "bulletList",
                            content: [
                                {
                                    type: "listItem",
                                    content: [
                                        {
                                            type: "paragraph",
                                            attrs: { textBlockStyle: "highlight" },
                                            content: [{ type: "text", text: "Highlighted bullet" }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept a list item paragraph with null textBlockStyle", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "bulletList",
                            content: [
                                {
                                    type: "listItem",
                                    content: [
                                        {
                                            type: "paragraph",
                                            attrs: { textBlockStyle: null },
                                            content: [{ type: "text", text: "Default bullet" }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });
    });

    describe("inlineStyles", () => {
        const block = createTipTapRichTextBlock(
            {
                supports: ["bold"],
                inlineStyles: [{ name: "highlight" }, { name: "tag" }],
            },
            "TestInlineStyles",
        );

        it("should accept text with inlineStyle mark", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "inlineStyle", attrs: { type: "highlight" } }], text: "Highlighted" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept text with inlineStyle and bold marks combined", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "bold" }, { type: "inlineStyle", attrs: { type: "tag" } }], text: "Bold Tag" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept text without inlineStyle mark", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Plain text" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });
    });

    describe("inlineStyles rejected when not configured", () => {
        const block = createTipTapRichTextBlock({ supports: ["bold"] }, "TestNoInlineStyles");

        it("should reject inlineStyle mark when inlineStyles not configured", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "inlineStyle", attrs: { type: "highlight" } }], text: "Highlighted" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });
    });

    describe("inlineStyles with appliesTo", () => {
        const block = createTipTapRichTextBlock(
            {
                supports: ["bold", "heading"],
                inlineStyles: [
                    { name: "highlight" },
                    { name: "tag", appliesTo: ["paragraph"] },
                    { name: "heading-accent", appliesTo: ["heading-1", "heading-2"] },
                ],
            },
            "TestInlineStylesAppliesTo",
        );

        it("should accept inline style without appliesTo in any block type", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "heading",
                            attrs: { level: 1 },
                            content: [{ type: "text", marks: [{ type: "inlineStyle", attrs: { type: "highlight" } }], text: "Highlight heading" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept inline style in a matching block type", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "inlineStyle", attrs: { type: "tag" } }], text: "Tagged" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject inline style in a non-matching block type", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "heading",
                            attrs: { level: 1 },
                            content: [{ type: "text", marks: [{ type: "inlineStyle", attrs: { type: "tag" } }], text: "Tag in heading" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should accept heading-accent in heading-1", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "heading",
                            attrs: { level: 1 },
                            content: [{ type: "text", marks: [{ type: "inlineStyle", attrs: { type: "heading-accent" } }], text: "Accent heading" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject heading-accent in heading-3", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "heading",
                            attrs: { level: 3 },
                            content: [
                                { type: "text", marks: [{ type: "inlineStyle", attrs: { type: "heading-accent" } }], text: "Accent heading 3" },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject heading-accent in a paragraph", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", marks: [{ type: "inlineStyle", attrs: { type: "heading-accent" } }], text: "Accent in paragraph" },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });
    });

    describe("minimal schema (no supports)", () => {
        const block = createTipTapRichTextBlock({ supports: [] }, "TestMinimal");

        it("should accept a plain paragraph", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Plain text" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject bold (not in supports)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "bold" }], text: "Bold" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject strike (not in supports)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", marks: [{ type: "strike" }], text: "Struck" }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });
    });

    describe("schema with link block", () => {
        const LinkBlock = createLinkBlock({ supportedBlocks: { external: ExternalLinkBlock } }, "TestLink");
        const block = createTipTapRichTextBlock({ link: LinkBlock }, "TestWithLink");

        it("should accept text with a valid link mark", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    marks: [
                                        {
                                            type: "link",
                                            attrs: {
                                                data: {
                                                    attachedBlocks: [
                                                        {
                                                            type: "external",
                                                            props: { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false },
                                                        },
                                                    ],
                                                    activeType: "external",
                                                },
                                            },
                                        },
                                    ],
                                    text: "click here",
                                },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept content without any link marks", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "No links" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should return childBlocksInfo for link marks", () => {
            const blockData = block.blockDataFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    marks: [
                                        {
                                            type: "link",
                                            attrs: {
                                                data: {
                                                    attachedBlocks: [
                                                        {
                                                            type: "external",
                                                            props: { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false },
                                                        },
                                                    ],
                                                    activeType: "external",
                                                },
                                            },
                                        },
                                    ],
                                    text: "first link",
                                },
                                { type: "text", text: " and " },
                                {
                                    type: "text",
                                    marks: [
                                        {
                                            type: "link",
                                            attrs: {
                                                data: {
                                                    attachedBlocks: [
                                                        {
                                                            type: "external",
                                                            props: { targetUrl: "https://other.com", openInNewWindow: true, noFollow: false },
                                                        },
                                                    ],
                                                    activeType: "external",
                                                },
                                            },
                                        },
                                    ],
                                    text: "second link",
                                },
                            ],
                        },
                    ],
                },
            });

            const childBlocks = blockData.childBlocksInfo();
            expect(childBlocks).toHaveLength(2);

            expect(childBlocks[0].visible).toBe(true);
            expect(childBlocks[0].name).toBe("TestLink");
            expect(childBlocks[0].relJsonPath).toEqual(["tipTapContent", "content", "0", "content", "0", "marks", "0", "attrs", "data"]);

            expect(childBlocks[1].visible).toBe(true);
            expect(childBlocks[1].name).toBe("TestLink");
            expect(childBlocks[1].relJsonPath).toEqual(["tipTapContent", "content", "0", "content", "2", "marks", "0", "attrs", "data"]);
        });

        it("should return empty childBlocksInfo when no link marks", () => {
            const blockData = block.blockDataFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "No links" }] }],
                },
            });

            expect(blockData.childBlocksInfo()).toHaveLength(0);
        });

        it("should reject link mark with invalid link data", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    marks: [
                                        {
                                            type: "link",
                                            attrs: {
                                                data: {
                                                    attachedBlocks: [{ type: "invalid", props: {} }],
                                                    activeType: "invalid",
                                                },
                                            },
                                        },
                                    ],
                                    text: "bad link",
                                },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });
    });

    describe("maxTextBlocks option", () => {
        const block = createTipTapRichTextBlock({ maxTextBlocks: 2 }, "TestMaxBlocks");

        it("should accept content within maxTextBlocks limit", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "First" }] },
                        { type: "paragraph", content: [{ type: "text", text: "Second" }] },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept content with fewer blocks than maxTextBlocks", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Only one" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject content exceeding maxTextBlocks limit", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "First" }] },
                        { type: "paragraph", content: [{ type: "text", text: "Second" }] },
                        { type: "paragraph", content: [{ type: "text", text: "Third" }] },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe("tipTapContent");
        });

        it("should reject content with many blocks exceeding limit", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "1" }] },
                        { type: "paragraph", content: [{ type: "text", text: "2" }] },
                        { type: "paragraph", content: [{ type: "text", text: "3" }] },
                        { type: "paragraph", content: [{ type: "text", text: "4" }] },
                        { type: "paragraph", content: [{ type: "text", text: "5" }] },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });
    });

    describe("schema with placeholders", () => {
        const block = createTipTapRichTextBlock(
            {
                supports: ["bold"],
                placeholders: [{ name: "firstName" }, { name: "lastName" }],
            },
            "TestPlaceholders",
        );

        it("should accept a placeholder with a valid name", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", text: "Hello " },
                                { type: "placeholder", attrs: { name: "firstName" } },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject a placeholder with a non-existing name", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "placeholder", attrs: { name: "unknownField" } }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe("tipTapContent");
        });
    });

    describe("schema without placeholders", () => {
        const block = createTipTapRichTextBlock({ supports: ["bold"] }, "TestNoPlaceholders");

        it("should reject a placeholder node when no placeholders are configured", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "placeholder", attrs: { name: "firstName" } }],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe("tipTapContent");
        });
    });

    describe("listLevelMax option", () => {
        const block = createTipTapRichTextBlock({ listLevelMax: 2 }, "TestListLevelMax");

        it("should accept a flat list (depth 1)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "bulletList",
                            content: [
                                { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item 1" }] }] },
                                { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item 2" }] }] },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should accept a nested list within limit (depth 2)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "bulletList",
                            content: [
                                {
                                    type: "listItem",
                                    content: [
                                        { type: "paragraph", content: [{ type: "text", text: "Item 1" }] },
                                        {
                                            type: "bulletList",
                                            content: [
                                                {
                                                    type: "listItem",
                                                    content: [{ type: "paragraph", content: [{ type: "text", text: "Nested" }] }],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject a nested list exceeding limit (depth 3)", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "bulletList",
                            content: [
                                {
                                    type: "listItem",
                                    content: [
                                        { type: "paragraph", content: [{ type: "text", text: "Item 1" }] },
                                        {
                                            type: "bulletList",
                                            content: [
                                                {
                                                    type: "listItem",
                                                    content: [
                                                        { type: "paragraph", content: [{ type: "text", text: "Nested" }] },
                                                        {
                                                            type: "bulletList",
                                                            content: [
                                                                {
                                                                    type: "listItem",
                                                                    content: [
                                                                        {
                                                                            type: "paragraph",
                                                                            content: [{ type: "text", text: "Too deep" }],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe("tipTapContent");
        });

        it("should reject ordered list exceeding limit", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "orderedList",
                            content: [
                                {
                                    type: "listItem",
                                    content: [
                                        { type: "paragraph", content: [{ type: "text", text: "Item 1" }] },
                                        {
                                            type: "orderedList",
                                            content: [
                                                {
                                                    type: "listItem",
                                                    content: [
                                                        { type: "paragraph", content: [{ type: "text", text: "Nested" }] },
                                                        {
                                                            type: "orderedList",
                                                            content: [
                                                                {
                                                                    type: "listItem",
                                                                    content: [
                                                                        {
                                                                            type: "paragraph",
                                                                            content: [{ type: "text", text: "Too deep" }],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should accept content without lists regardless of listLevelMax", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "Just text" }] },
                        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Heading" }] },
                    ],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should work with listLevelMax of 1 (flat lists only)", async () => {
            const flatOnlyBlock = createTipTapRichTextBlock({ listLevelMax: 1 }, "TestListLevelMaxFlat");

            const validInput = flatOnlyBlock.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "bulletList",
                            content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item" }] }] }],
                        },
                    ],
                },
            });
            const validErrors = await validate(validInput);
            expect(validErrors).toHaveLength(0);

            const invalidInput = flatOnlyBlock.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "bulletList",
                            content: [
                                {
                                    type: "listItem",
                                    content: [
                                        { type: "paragraph", content: [{ type: "text", text: "Item" }] },
                                        {
                                            type: "bulletList",
                                            content: [
                                                {
                                                    type: "listItem",
                                                    content: [{ type: "paragraph", content: [{ type: "text", text: "Nested" }] }],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            });
            const invalidErrors = await validate(invalidInput);
            expect(invalidErrors).toHaveLength(1);
        });
    });

    describe("headingLevels option", () => {
        const block = createTipTapRichTextBlock({ headingLevels: [2, 3, 4] }, "TestHeadingLevels");

        it("should accept a heading within the allowed levels", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Heading" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject a heading level outside the allowed levels", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Heading" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe("tipTapContent");
        });

        it("should throw when headingLevels is invalid", () => {
            expect(() => createTipTapRichTextBlock({ headingLevels: [] }, "TestInvalidHeadingLevelsEmpty")).toThrow();
            expect(() => createTipTapRichTextBlock({ headingLevels: [0, 2, 3] }, "TestInvalidHeadingLevelsZero")).toThrow();
            expect(() => createTipTapRichTextBlock({ headingLevels: [1, 7] }, "TestInvalidHeadingLevelsSeven")).toThrow();
            expect(() => createTipTapRichTextBlock({ headingLevels: [1, 1, 2] }, "TestInvalidHeadingLevelsDuplicate")).toThrow();
            expect(() => createTipTapRichTextBlock({ headingLevels: [1.5, 2] }, "TestInvalidHeadingLevelsFraction")).toThrow();
        });

        it("should accept content without headings regardless of headingLevels", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Just text" }] }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });
    });

    describe("childBlocks option", () => {
        const block = createTipTapRichTextBlock(
            { supports: ["bold"], childBlocks: { externalLink: { block: ExternalLinkBlock, display: "block" } } },
            "TestChildBlocks",
        );

        const cmsBlockNode = (blockType: string, data: unknown) => ({
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "intro" }] },
                { type: "cmsBlock", attrs: { blockType, data } },
            ],
        });

        it("should accept a valid child block node", async () => {
            const input = block.blockInputFactory({
                tipTapContent: cmsBlockNode("externalLink", { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false }),
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject a child block node with an unknown blockType", async () => {
            const input = block.blockInputFactory({
                tipTapContent: cmsBlockNode("UnknownBlock", { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false }),
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe("tipTapContent");
        });

        it("should reject a child block node with invalid data", async () => {
            const input = block.blockInputFactory({
                tipTapContent: cmsBlockNode("externalLink", { targetUrl: "not-a-url", openInNewWindow: false, noFollow: false }),
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject a child block node when no childBlocks are configured", async () => {
            const blockWithoutChildBlocks = createTipTapRichTextBlock({ supports: ["bold"] }, "TestNoChildBlocks");
            const input = blockWithoutChildBlocks.blockInputFactory({
                tipTapContent: cmsBlockNode("externalLink", { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false }),
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should return childBlocksInfo for child block nodes", () => {
            const blockData = block.blockDataFactory({
                tipTapContent: cmsBlockNode("externalLink", { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false }),
            });

            const childBlocks = blockData.childBlocksInfo();
            expect(childBlocks).toHaveLength(1);
            expect(childBlocks[0].visible).toBe(true);
            expect(childBlocks[0].name).toBe("ExternalLink");
            expect(childBlocks[0].relJsonPath).toEqual(["tipTapContent", "content", "1", "attrs", "data"]);
        });
    });

    describe("inline childBlocks option", () => {
        const block = createTipTapRichTextBlock(
            { supports: ["bold"], childBlocks: { externalLink: { block: ExternalLinkBlock, display: "inline" } } },
            "TestInlineChildBlocks",
        );

        const inlineCmsBlockNode = (blockType: string, data: unknown) => ({
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: "price " },
                        { type: "cmsInlineBlock", attrs: { blockType, data } },
                    ],
                },
            ],
        });

        it("should accept a valid inline child block node", async () => {
            const input = block.blockInputFactory({
                tipTapContent: inlineCmsBlockNode("externalLink", { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false }),
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(0);
        });

        it("should reject an inline child block node with invalid data", async () => {
            const input = block.blockInputFactory({
                tipTapContent: inlineCmsBlockNode("externalLink", { targetUrl: "not-a-url", openInNewWindow: false, noFollow: false }),
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should reject a block-level cmsBlock node when the child block is configured as inline", async () => {
            const input = block.blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "cmsBlock", attrs: { blockType: "ExternalLink", data: { targetUrl: "https://example.com" } } }],
                },
            });
            const errors = await validate(input);
            expect(errors).toHaveLength(1);
        });

        it("should return childBlocksInfo for inline child block nodes", () => {
            const blockData = block.blockDataFactory({
                tipTapContent: inlineCmsBlockNode("externalLink", { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false }),
            });

            const childBlocks = blockData.childBlocksInfo();
            expect(childBlocks).toHaveLength(1);
            expect(childBlocks[0].name).toBe("ExternalLink");
            expect(childBlocks[0].relJsonPath).toEqual(["tipTapContent", "content", "0", "content", "1", "attrs", "data"]);
        });
    });
});

describe("createTipTapRichTextBlock block typing", () => {
    const block = createTipTapRichTextBlock({ supports: ["bold"] }, "TestTyping");

    // The typed return value is what makes the block usable in fixtures: `blockInputFactory`
    // validates the `tipTapContent` shape at the call site (no type annotation needed) and the
    // resulting input/data expose `tipTapContent` as a typed property — rather than the untyped
    // `BlockInputInterface`/`BlockDataInterface` the factory returned before.
    it("should validate the input shape and expose typed tipTapContent on the input", () => {
        const input = block.blockInputFactory({
            tipTapContent: {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Typed" }] }],
            },
        });

        expect(input.tipTapContent.type).toBe("doc");
    });

    it("should expose typed tipTapContent on the transformed block data", () => {
        const blockData = block
            .blockInputFactory({
                tipTapContent: {
                    type: "doc",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Typed data" }] }],
                },
            })
            .transformToBlockData();

        expect(blockData.tipTapContent.content?.[0].content?.[0].text).toBe("Typed data");
    });

    it("should expose typed tipTapContent via blockDataFactory", () => {
        const blockData = block.blockDataFactory({
            tipTapContent: {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Factory data" }] }],
            },
        });

        expect(blockData.tipTapContent.content?.[0].content?.[0].text).toBe("Factory data");
    });

    it("should return values assignable to the exported interfaces", () => {
        const input: TipTapRichTextBlockInputInterface = block.blockInputFactory({
            tipTapContent: {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Interfaces" }] }],
            },
        });
        const blockData: TipTapRichTextBlockDataInterface = input.transformToBlockData();

        expect(input.tipTapContent.type).toBe("doc");
        expect(blockData.tipTapContent.type).toBe("doc");
    });
});
