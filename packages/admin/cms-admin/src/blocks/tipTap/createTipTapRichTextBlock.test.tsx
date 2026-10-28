import { Editor, type JSONContent } from "@tiptap/core";
import { describe, expect, it, vi } from "vitest";

import { render, within } from "../../testing/test-utils";
import type { BlockContext } from "../context/BlockContext";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface, type LinkBlockInterface } from "../types";
import {
    buildTipTapExtensions,
    createTipTapRichTextBlock,
    isTipTapRichTextEmpty,
    resolveTipTapOptions,
    type TipTapRichTextBlockFactoryOptions,
    type TipTapRichTextBlockState,
    type TipTapTextBlock,
    type TipTapTextBlockElementProps,
} from "./createTipTapRichTextBlock";

describe("createTipTapRichTextBlock", () => {
    it("should throw for an unsupported text block tag instead of silently creating a broken node", () => {
        expect(() => createTipTapRichTextBlock({ textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "div" as "p" }] })).toThrow();
    });

    it("should throw for an empty textBlocks array, because no text block type would be left", () => {
        expect(() => createTipTapRichTextBlock({ textBlocks: [] })).toThrow();
    });

    it("should throw for a duplicate text block name, because the name identifies the text block in the content", () => {
        expect(() =>
            createTipTapRichTextBlock({
                textBlocks: [
                    { name: "heading", label: "Heading 1", tag: "h1" },
                    { name: "heading", label: "Heading 2", tag: "h2" },
                ],
            }),
        ).toThrow();
    });

    it("should throw when a text block or a list offers the same style twice, because a style's name identifies it", () => {
        const style = { name: "copy100", label: "Copy 100", element: (props: TipTapTextBlockElementProps) => <p {...props} /> };
        expect(() =>
            createTipTapRichTextBlock({ textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p", styles: [style, style] }] }),
        ).toThrow();
        expect(() => createTipTapRichTextBlock({ orderedList: { styles: [style, style] } })).toThrow();
    });

    it("should throw when the defaultStyle is not one of the text block's styles", () => {
        const style = { name: "copy100", label: "Copy 100", element: (props: TipTapTextBlockElementProps) => <p {...props} /> };
        expect(() =>
            createTipTapRichTextBlock({
                textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p", styles: [style], defaultStyle: "copy200" }],
            }),
        ).toThrow();
    });

    it("should start content with the default text block's default style", () => {
        const style = { name: "copy100", label: "Copy 100", element: (props: TipTapTextBlockElementProps) => <p {...props} /> };
        const block = createTipTapRichTextBlock({
            textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p", styles: [style], defaultStyle: "copy100" }],
        });
        expect(block.defaultValues()).toEqual({
            tipTapContent: { type: "doc", content: [{ type: "textBlock", attrs: { textBlock: "paragraph", textBlockStyle: "copy100" } }] },
        });
    });

    it("should throw when the defaultTextBlock is not one of the text blocks", () => {
        expect(() =>
            createTipTapRichTextBlock({ textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p" }], defaultTextBlock: "heading-1" }),
        ).toThrow();
    });

    it("should throw when lists are enabled without a paragraph text block", () => {
        const textBlocks: TipTapTextBlock[] = [{ name: "heading-1", label: "Heading 1", tag: "h1" }];
        expect(() => createTipTapRichTextBlock({ textBlocks, unorderedList: true })).toThrow();
        expect(() => createTipTapRichTextBlock({ textBlocks, orderedList: true })).toThrow();
    });

    it("should tell two text blocks sharing a tag apart by their name", () => {
        const block = createTipTapRichTextBlock({
            textBlocks: [
                { name: "display", label: "Display", tag: "h1" },
                { name: "heading-1", label: "Heading 1", tag: "h1" },
            ],
            defaultTextBlock: "heading-1",
        });
        expect(block.defaultValues()).toEqual({
            tipTapContent: { type: "doc", content: [{ type: "textBlock", attrs: { textBlock: "heading-1" } }] },
        });
    });

    it("should start content with the default text block, independent of the type select's order", () => {
        const block = createTipTapRichTextBlock({
            textBlocks: [
                { name: "heading-2", label: "Heading 2", tag: "h2" },
                { name: "heading-3", label: "Heading 3", tag: "h3" },
            ],
            defaultTextBlock: "heading-3",
        });
        expect(block.defaultValues()).toEqual({
            tipTapContent: { type: "doc", content: [{ type: "textBlock", attrs: { textBlock: "heading-3" } }] },
        });
    });

    describe("editor", () => {
        function createEditor(options: TipTapRichTextBlockFactoryOptions = {}) {
            return new Editor({
                extensions: buildTipTapExtensions({
                    resolvedOptions: resolveTipTapOptions(options),
                    inlineStyles: [],
                    placeholders: [],
                    childBlocks: options.childBlocks ?? {},
                    maxTextBlocks: options.maxTextBlocks,
                }),
            });
        }

        const pressKey = (editor: Editor, key: string) =>
            editor.view.someProp("handleKeyDown", (handleKeyDown) => handleKeyDown(editor.view, new KeyboardEvent("keydown", { key })));

        const listItem = (text: string): JSONContent => ({
            type: "listItem",
            content: [{ type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text }] }],
        });

        it("should use the text block as the schema's default block type, not a list", () => {
            const editor = createEditor();
            expect(editor.schema.topNodeType.contentMatch.defaultType?.name).toBe("textBlock");
        });

        it.each(["orderedList", "bulletList"])("should not add an empty text block after an %s at the end of the content", (listType) => {
            const editor = createEditor();

            editor.commands.setContent({ type: "doc", content: [{ type: listType, content: [listItem("item")] }] });

            expect(editor.getJSON().content?.map((node) => node.type)).toEqual([listType]);
        });

        it.each(["orderedList", "bulletList"])(
            "should delete an empty text block after an %s at the end of the content with Backspace",
            (listType) => {
                const editor = createEditor();
                editor.commands.setContent({
                    type: "doc",
                    content: [
                        { type: listType, content: [listItem("item")] },
                        { type: "textBlock", attrs: { textBlock: "paragraph" } },
                    ],
                });
                editor.commands.setTextSelection(editor.state.doc.content.size - 1);

                pressKey(editor, "Backspace");

                expect(editor.getJSON().content).toEqual([expect.objectContaining({ type: listType, content: [listItem("item")] })]);
            },
        );

        it.each(["orderedList", "bulletList"])("should leave an %s at the end of the content with Enter in its empty last item", (listType) => {
            const editor = createEditor();
            editor.commands.setContent({ type: "doc", content: [{ type: listType, content: [listItem("item")] }] });
            editor.commands.setTextSelection(editor.state.doc.content.size - 3);

            pressKey(editor, "Enter");
            pressKey(editor, "Enter");

            expect(editor.getJSON().content?.map((node) => node.type)).toEqual([listType, "textBlock"]);
        });

        it("should leave a single empty default text block after deleting all content", () => {
            const editor = createEditor();
            editor.commands.setContent({ type: "doc", content: [{ type: "orderedList", content: [listItem("item")] }] });

            editor.commands.selectAll();
            editor.commands.deleteSelection();

            expect(editor.getJSON()).toEqual({ type: "doc", content: [{ type: "textBlock", attrs: { textBlock: "paragraph" } }] });
        });

        it("should fill an emptied heading-only block with the default text block", () => {
            const editor = createEditor({
                textBlocks: [
                    { name: "heading-1", label: "Heading 1", tag: "h1" },
                    { name: "heading-2", label: "Heading 2", tag: "h2" },
                ],
                defaultTextBlock: "heading-2",
            });
            editor.commands.setContent({
                type: "doc",
                content: [{ type: "textBlock", attrs: { textBlock: "heading-1" }, content: [{ type: "text", text: "Title" }] }],
            });

            editor.commands.selectAll();
            editor.commands.deleteSelection();

            expect(editor.getJSON()).toEqual({ type: "doc", content: [{ type: "textBlock", attrs: { textBlock: "heading-2" } }] });
        });

        it("should drop a style the new text block doesn't offer when no text block has a defaultStyle", () => {
            const style = { name: "copy100", label: "Copy 100", element: (props: TipTapTextBlockElementProps) => <p {...props} /> };
            const editor = createEditor({
                textBlocks: [
                    { name: "paragraph", label: "Paragraph", tag: "p", styles: [style] },
                    { name: "heading-1", label: "Heading 1", tag: "h1" },
                ],
            });
            editor.commands.setContent({
                type: "doc",
                content: [
                    { type: "textBlock", attrs: { textBlock: "paragraph", textBlockStyle: "copy100" }, content: [{ type: "text", text: "Title" }] },
                    { type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text: "Copy" }] },
                ],
            });
            editor.commands.setTextSelection(1);

            editor.commands.updateAttributes("textBlock", { textBlock: "heading-1" });

            expect(editor.getJSON().content?.map((node) => node.attrs)).toEqual([
                { textBlock: "heading-1", textBlockStyle: null },
                { textBlock: "paragraph", textBlockStyle: null },
            ]);
        });

        const paragraph = (text: string): JSONContent => ({
            type: "textBlock",
            attrs: { textBlock: "paragraph" },
            content: [{ type: "text", text }],
        });

        const childBlock: BlockInterface = {
            ...createBlockSkeleton(),
            name: "Child",
            displayName: "Child",
            category: BlockCategory.Other,
            defaultValues: () => ({}),
            AdminComponent: () => null,
            previewContent: () => [],
        };

        const insertChildBlockAtEnd = (editor: Editor) => {
            editor.commands.setTextSelection(editor.state.doc.content.size - 1);
            editor.commands.insertCmsBlock({ blockType: "child", data: {} });
        };

        it("should not add an empty text block after a child block when it would exceed maxTextBlocks", () => {
            const editor = createEditor({ maxTextBlocks: 2, childBlocks: { child: { block: childBlock, display: "block" } } });
            editor.commands.setContent({ type: "doc", content: [paragraph("first")] });

            insertChildBlockAtEnd(editor);

            expect(editor.getJSON().content?.map((node) => node.type)).toEqual(["textBlock", "cmsBlock"]);
        });

        it("should add an empty text block after a child block below maxTextBlocks", () => {
            const editor = createEditor({ maxTextBlocks: 3, childBlocks: { child: { block: childBlock, display: "block" } } });
            editor.commands.setContent({ type: "doc", content: [paragraph("first")] });

            insertChildBlockAtEnd(editor);

            expect(editor.getJSON().content?.map((node) => node.type)).toEqual(["textBlock", "cmsBlock", "textBlock"]);
        });
    });

    describe("maxTextBlocks", () => {
        const paragraph = (text: string): JSONContent => ({
            type: "textBlock",
            attrs: { textBlock: "paragraph" },
            content: [{ type: "text", text }],
        });

        it("should cut off text blocks pasted over the limit and keep the state up to date", () => {
            const block = createTipTapRichTextBlock({ maxTextBlocks: 2 });
            const updateState = vi.fn();
            const { container } = render(
                <block.AdminComponent state={{ tipTapContent: { type: "doc", content: [paragraph("first")] } }} updateState={updateState} />,
            );
            const editor = (container.querySelector(".tiptap") as (HTMLElement & { editor?: Editor }) | null)?.editor;
            if (!editor) {
                throw new Error("Expected the editor to be rendered");
            }

            editor.commands.insertContentAt(editor.state.doc.content.size, [paragraph("second"), paragraph("third")]);

            expect(editor.getJSON().content).toEqual([paragraph("first"), paragraph("second")]);
            expect(updateState).toHaveBeenLastCalledWith({ tipTapContent: { type: "doc", content: [paragraph("first"), paragraph("second")] } });
        });
    });

    describe("alwaysShowTextBlockStyleSelect", () => {
        const style = { name: "copy100", label: "Copy 100", element: (props: TipTapTextBlockElementProps) => <p {...props} /> };
        const textBlocks: TipTapTextBlock[] = [{ name: "paragraph", label: "Paragraph", tag: "p", styles: [style] }];
        const listContent: JSONContent = {
            type: "doc",
            content: [
                {
                    type: "bulletList",
                    content: [
                        {
                            type: "listItem",
                            content: [{ type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text: "item" }] }],
                        },
                    ],
                },
            ],
        };

        it("should keep the style select disabled in a list without styles", () => {
            const block = createTipTapRichTextBlock({ textBlocks, alwaysShowTextBlockStyleSelect: true });
            const { container } = render(<block.AdminComponent state={{ tipTapContent: listContent }} updateState={vi.fn()} />);

            expect(within(container).queryByRole("combobox")?.getAttribute("aria-disabled")).toBe("true");
        });

        it("should hide the style select in a list without styles by default", () => {
            const block = createTipTapRichTextBlock({ textBlocks });
            const { container } = render(<block.AdminComponent state={{ tipTapContent: listContent }} updateState={vi.fn()} />);

            expect(within(container).queryByRole("combobox")).toBeNull();
        });

        it("should not show a style select when nothing has styles", () => {
            const block = createTipTapRichTextBlock({
                alwaysShowTextBlockStyleSelect: true,
                textBlocks: [{ name: "paragraph", label: "Paragraph", tag: "p" }],
            });
            const { container } = render(<block.AdminComponent state={{ tipTapContent: listContent }} updateState={vi.fn()} />);

            expect(within(container).queryByRole("combobox")).toBeNull();
        });
    });

    describe("previewContent", () => {
        const block = createTipTapRichTextBlock({});
        const previewContent = (content: JSONContent[]) => block.previewContent({ tipTapContent: { type: "doc", content } }, {} as BlockContext);
        const textBlock = (content: JSONContent[]): JSONContent => ({ type: "textBlock", attrs: { textBlock: "paragraph" }, content });

        it("should separate text blocks with a space instead of joining them directly", () => {
            expect(previewContent([textBlock([{ type: "text", text: "First" }]), textBlock([{ type: "text", text: "Second" }])])).toEqual([
                { type: "text", content: "First Second" },
            ]);
        });

        it("should separate list items with a space", () => {
            const listItem = (text: string): JSONContent => ({ type: "listItem", content: [textBlock([{ type: "text", text }])] });
            expect(previewContent([{ type: "bulletList", content: [listItem("First"), listItem("Second")] }])).toEqual([
                { type: "text", content: "First Second" },
            ]);
        });

        it("should replace a hard break with a space", () => {
            expect(previewContent([textBlock([{ type: "text", text: "First" }, { type: "hardBreak" }, { type: "text", text: "Second" }])])).toEqual([
                { type: "text", content: "First Second" },
            ]);
        });

        it("should keep the marked parts of a line together", () => {
            expect(
                previewContent([
                    textBlock([
                        { type: "text", text: "un" },
                        { type: "text", marks: [{ type: "bold" }], text: "believ" },
                        { type: "text", text: "able" },
                    ]),
                ]),
            ).toEqual([{ type: "text", content: "unbelievable" }]);
        });

        it("should skip empty lines instead of adding extra spaces", () => {
            expect(
                previewContent([
                    textBlock([{ type: "text", text: "First" }]),
                    textBlock([]),
                    textBlock([{ type: "text", text: "  " }]),
                    textBlock([{ type: "text", text: "Second" }]),
                ]),
            ).toEqual([{ type: "text", content: "First Second" }]);
        });

        it("should return no preview for empty content", () => {
            expect(previewContent([textBlock([])])).toEqual([]);
        });
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
            // Bold is enabled by default, which is what the bold mark in the seeded content needs to
            // be recognized when parsing the translated HTML back.
            const block = createTipTapRichTextBlock();
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "textBlock",
                            attrs: { textBlock: "paragraph" },
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
                childBlocks: { structured: { block: structuredChildBlock, display: "block" } },
            });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        { type: "textBlock", content: [{ type: "text", text: "Before" }] },
                        { type: "cmsBlock", attrs: { blockType: "structured", data: { nested: { value: "keep me" } } } },
                        { type: "textBlock", content: [{ type: "text", text: "After" }] },
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

            const block = createTipTapRichTextBlock({ link: falsyDataLinkBlock });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "textBlock",
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
                placeholders: [{ name: "firstName", label: "First Name" }],
            });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "textBlock",
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

            const block = createTipTapRichTextBlock({ link: falsyDataLinkBlock });
            const state: TipTapRichTextBlockState = {
                tipTapContent: {
                    type: "doc",
                    content: [
                        {
                            type: "textBlock",
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

describe("isTipTapRichTextEmpty", () => {
    const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content });

    it("should treat the default value of a block as empty", () => {
        expect(isTipTapRichTextEmpty(createTipTapRichTextBlock().defaultValues().tipTapContent)).toBe(true);
    });

    it("should treat several text blocks without text as empty", () => {
        expect(isTipTapRichTextEmpty(doc({ type: "textBlock", attrs: { textBlock: "heading-1" } }, { type: "textBlock" }))).toBe(true);
    });

    it("should not treat a document with text in a nested list item as empty", () => {
        const listItem: JSONContent = { type: "listItem", content: [{ type: "textBlock", content: [{ type: "text", text: "item" }] }] };
        expect(isTipTapRichTextEmpty(doc({ type: "textBlock" }, { type: "bulletList", content: [listItem] }))).toBe(false);
    });

    it("should not treat a document with only whitespace as empty, like isRichTextEmpty", () => {
        expect(isTipTapRichTextEmpty(doc({ type: "textBlock", content: [{ type: "text", text: " " }] }))).toBe(false);
    });

    it.each(["nonBreakingSpace", "softHyphen"])("should not treat a document with only a %s as empty", (type) => {
        expect(isTipTapRichTextEmpty(doc({ type: "textBlock", content: [{ type }] }))).toBe(false);
    });

    it("should not treat a document with only a child block as empty", () => {
        expect(isTipTapRichTextEmpty(doc({ type: "cmsBlock", attrs: { blockType: "image", data: {} } }))).toBe(false);
    });
});
