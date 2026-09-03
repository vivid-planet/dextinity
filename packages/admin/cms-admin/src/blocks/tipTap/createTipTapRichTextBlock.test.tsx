import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";

import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface, type LinkBlockInterface } from "../types";
import { createTipTapRichTextBlock, type TipTapRichTextBlockState } from "./createTipTapRichTextBlock";

describe("createTipTapRichTextBlock", () => {
    it("should throw for invalid headingLevels instead of silently creating a broken heading", () => {
        expect(() => createTipTapRichTextBlock({ headingLevels: [] })).toThrow();
        expect(() => createTipTapRichTextBlock({ headingLevels: [0, 2, 3] })).toThrow();
        expect(() => createTipTapRichTextBlock({ headingLevels: [1, 7] })).toThrow();
        expect(() => createTipTapRichTextBlock({ headingLevels: [1, 1, 2] })).toThrow();
        expect(() => createTipTapRichTextBlock({ headingLevels: [1.5, 2] })).toThrow();
    });

    describe("translateContent", () => {
        // The HTML round trip only needs to leave non-text data byte-for-byte identical; whether
        // translation itself changes the surrounding text is exercised separately below, so an
        // identity translate keeps most of these tests focused on the round trip.
        const identityTranslate = async (html: string): Promise<string> => html;

        // `translateContent` is optional on BlockInterface in general, but createTipTapRichTextBlock
        // always sets it — this narrows the type for the call sites below instead of asserting it away.
        async function translateBlockContent(
            block: ReturnType<typeof createTipTapRichTextBlock>,
            state: TipTapRichTextBlockState,
            translate: (text: string) => Promise<string>,
        ): Promise<TipTapRichTextBlockState> {
            if (!block.translateContent) {
                throw new Error("Expected translateContent to be defined");
            }
            return block.translateContent(state, translate);
        }

        it("sends the whole field as a single HTML request and keeps a mark's context intact", async () => {
            // `supports: []` isn't enough here: the bold mark in the seeded content needs the bold
            // extension registered to be recognized when parsing the translated HTML back.
            const block = createTipTapRichTextBlock({ supports: ["bold"] });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", text: "A " },
                                { type: "text", marks: [{ type: "bold" }], text: "bold" },
                                { type: "text", text: " word" },
                            ],
                        },
                    ],
                },
            };

            const translateCalls: string[] = [];
            const translate = async (html: string): Promise<string> => {
                translateCalls.push(html);
                return html;
            };

            const result = await translateBlockContent(block, state, translate);

            // One request for the whole field (not one per text node), and the bold run travels
            // together with its surrounding text instead of being sent as a separate fragment.
            expect(translateCalls).toHaveLength(1);
            expect(translateCalls[0]).toContain("A <strong>bold</strong> word");

            expect(result.tipTapContent).toEqual(state.tipTapContent);
        });

        it("preserves a child block's structured, non-string data", async () => {
            interface StructuredChildBlockState {
                nested: { value: string };
            }

            const structuredChildBlock: BlockInterface<StructuredChildBlockState, StructuredChildBlockState, StructuredChildBlockState> = {
                ...createBlockSkeleton(),
                name: "StructuredChild",
                displayName: "Structured Child",
                category: BlockCategory.Other,
                defaultValues: () => ({ nested: { value: "" } }),
                AdminComponent: () => null,
                previewContent: () => [],
            };

            const block = createTipTapRichTextBlock({
                supports: [],
                childBlocks: { structured: { block: structuredChildBlock, display: "block" } },
            });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: "Before" }] },
                        { type: "cmsBlock", attrs: { blockType: "structured", data: { nested: { value: "keep me" } } } },
                        { type: "paragraph", content: [{ type: "text", text: "After" }] },
                    ],
                },
            };

            const result = await translateBlockContent(block, state, identityTranslate);

            const cmsBlockNode = result.tipTapContent.content?.find((node: JSONContent) => node.type === "cmsBlock");
            // Without externalizing it first, this object would come back as the literal string
            // "[object Object]" — HTML attribute serialization stringifies non-string values.
            expect(cmsBlockNode?.attrs?.data).toEqual({ nested: { value: "keep me" } });
        });

        it("preserves a link mark's falsy data instead of turning it into a string", async () => {
            interface FalsyDataLinkBlockState {
                url: string;
            }

            const falsyDataLinkBlock: BlockInterface<FalsyDataLinkBlockState, FalsyDataLinkBlockState, FalsyDataLinkBlockState> & LinkBlockInterface =
                {
                    ...createBlockSkeleton(),
                    name: "FalsyDataLink",
                    displayName: "Link",
                    category: BlockCategory.Other,
                    defaultValues: () => ({ url: "" }),
                    AdminComponent: () => null,
                    previewContent: () => [],
                };

            const block = createTipTapRichTextBlock({ supports: [], link: falsyDataLinkBlock });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", text: "Before " },
                                // `false` is a valid (if unusual) value for a link mark's `data`: `setCmsLink`'s
                                // `data` is typed as `any`, so nothing rules it out.
                                { type: "text", marks: [{ type: "link", attrs: { data: false } }], text: "link" },
                                { type: "text", text: " after" },
                            ],
                        },
                    ],
                },
            };

            const result = await translateBlockContent(block, state, identityTranslate);

            const paragraph = result.tipTapContent.content?.[0];
            const linkTextNode = paragraph?.content?.find((node: JSONContent) => node.marks?.some((mark) => mark.type === "link"));
            // Without unconditional externalization, `false` would come back as the string "false".
            expect(linkTextNode?.marks?.[0]?.attrs?.data).toBe(false);
        });

        it("reconstructs a placeholder from its data-name attribute, not its rendered {{name}} text", async () => {
            const block = createTipTapRichTextBlock({
                supports: [],
                placeholders: [{ name: "firstName", label: "First Name" }],
            });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", text: "Hello " },
                                { type: "placeholder", attrs: { name: "firstName" } },
                                { type: "text", text: ", welcome." },
                            ],
                        },
                    ],
                },
            };

            const result = await translateBlockContent(block, state, identityTranslate);

            const paragraph = result.tipTapContent.content?.[0];
            expect(paragraph?.content).toContainEqual({ type: "placeholder", attrs: { name: "firstName" } });
        });

        it("rejects a translate function that mangles HTML markup instead of silently corrupting link data", async () => {
            interface FalsyDataLinkBlockState {
                url: string;
            }

            const falsyDataLinkBlock: BlockInterface<FalsyDataLinkBlockState, FalsyDataLinkBlockState, FalsyDataLinkBlockState> & LinkBlockInterface =
                {
                    ...createBlockSkeleton(),
                    name: "FalsyDataLink",
                    displayName: "Link",
                    category: BlockCategory.Other,
                    defaultValues: () => ({ url: "" }),
                    AdminComponent: () => null,
                    previewContent: () => [],
                };

            const block = createTipTapRichTextBlock({ supports: [], link: falsyDataLinkBlock });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                { type: "text", text: "Before " },
                                { type: "text", marks: [{ type: "link", attrs: { data: { url: "https://example.com" } } }], text: "link" },
                                { type: "text", text: " after" },
                            ],
                        },
                    ],
                },
            };

            // `translate` is typed as an unconstrained (text: string) => Promise<string>, so nothing in
            // the type system rules out an implementation that mangles the HTML itself instead of only
            // the human-readable text.
            const corruptingTranslate = async (html: string): Promise<string> => html.toUpperCase();

            await expect(translateBlockContent(block, state, corruptingTranslate)).rejects.toThrow(/placeholder id/);
        });
    });
});
