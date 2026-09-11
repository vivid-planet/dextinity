import { describe, expect, it } from "vitest";

import type { Block } from "../../block";
import { buildStrippedTipTapDoc, convertDraftJsToTipTap, type DraftJsContent } from "./convertDraftJsToTipTap";

const defaultSupports = [
    "bold",
    "italic",
    "underline",
    "strike",
    "sub",
    "sup",
    "heading",
    "ordered-list",
    "unordered-list",
    "non-breaking-space",
    "soft-hyphen",
] as const;

// Minimal Block stub used only for truthiness checks inside the converter
const dummyLinkBlock = { name: "Link" } as unknown as Block;

type DraftBlock = DraftJsContent["blocks"][number];

function makeBlock(overrides: Partial<DraftBlock> = {}): DraftBlock {
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

describe("convertDraftJsToTipTap", () => {
    describe("empty input", () => {
        it("returns minimal doc for undefined input", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = convertDraftJsToTipTap(undefined as any);
            expect(result).toEqual({ type: "doc", content: [{ type: "paragraph" }] });
        });

        it("returns minimal doc for empty blocks array", () => {
            const result = convertDraftJsToTipTap({ blocks: [], entityMap: {} });
            expect(result).toEqual({ type: "doc", content: [{ type: "paragraph" }] });
        });
    });

    describe("block-type mapping", () => {
        it("maps unstyled to paragraph", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unstyled", text: "Hello" })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result).toEqual({
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
            });
        });

        it.each([
            ["header-one", 1],
            ["header-two", 2],
            ["header-three", 3],
            ["header-four", 4],
            ["header-five", 5],
            ["header-six", 6],
        ])("maps %s to heading level %d", (type, level) => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type, text: "Title" })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toEqual([{ type: "heading", attrs: { level }, content: [{ type: "text", text: "Title" }] }]);
        });

        it("falls back to paragraph when heading not supported", () => {
            const result = convertDraftJsToTipTap({ blocks: [makeBlock({ type: "header-one", text: "Title" })], entityMap: {} }, { supports: [] });
            expect(result.content).toEqual([{ type: "paragraph", content: [{ type: "text", text: "Title" }] }]);
        });

        it("maps blockquote to paragraph", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "blockquote", text: "Quote" })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toEqual([{ type: "paragraph", content: [{ type: "text", text: "Quote" }] }]);
        });

        it("maps unknown block type to paragraph", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "atomic", text: "x" })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toEqual([{ type: "paragraph", content: [{ type: "text", text: "x" }] }]);
        });

        it("emits empty paragraph for empty text", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unstyled", text: "" })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toEqual([{ type: "paragraph" }]);
        });

        it("maps a block type from textBlockStyleMap to a paragraph with textBlockStyle attr", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "paragraph-small", text: "tiny" })], entityMap: {} },
                { supports: [...defaultSupports], textBlockStyleMap: { "paragraph-small": "small" } },
            );
            expect(result.content).toEqual([{ type: "paragraph", attrs: { textBlockStyle: "small" }, content: [{ type: "text", text: "tiny" }] }]);
        });

        it("keeps the heading level when a header type is mapped to a textBlockStyle", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "header-two", text: "Title" })], entityMap: {} },
                { supports: [...defaultSupports], textBlockStyleMap: { "header-two": "headline450" } },
            );
            expect(result.content).toEqual([
                { type: "heading", attrs: { level: 2, textBlockStyle: "headline450" }, content: [{ type: "text", text: "Title" }] },
            ]);
        });

        it("falls back to a paragraph for a mapped header type when heading is not supported", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "header-two", text: "Title" })], entityMap: {} },
                { supports: [], textBlockStyleMap: { "header-two": "headline450" } },
            );
            expect(result.content).toEqual([
                { type: "paragraph", attrs: { textBlockStyle: "headline450" }, content: [{ type: "text", text: "Title" }] },
            ]);
        });

        it("maps a custom block type to a heading with textBlockStyle via textBlockType", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "headline450", text: "Title" })], entityMap: {} },
                {
                    supports: [...defaultSupports],
                    textBlockStyleMap: { headline450: { textBlockType: "heading-2", textBlockStyle: "headline450" } },
                },
            );
            expect(result.content).toEqual([
                { type: "heading", attrs: { level: 2, textBlockStyle: "headline450" }, content: [{ type: "text", text: "Title" }] },
            ]);
        });

        it("maps a custom block type to a heading without textBlockStyle", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "headline450", text: "Title" })], entityMap: {} },
                { supports: [...defaultSupports], textBlockStyleMap: { headline450: { textBlockType: "heading-2" } } },
            );
            expect(result.content).toEqual([{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] }]);
        });

        it("textBlockType overrides the heading level derived from the DraftJS header type", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "header-one", text: "Title" })], entityMap: {} },
                { supports: [...defaultSupports], textBlockStyleMap: { "header-one": { textBlockType: "heading-2" } } },
            );
            expect(result.content).toEqual([{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] }]);
        });

        it("converts a header type to a paragraph when mapped to textBlockType paragraph", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "header-one", text: "Title" })], entityMap: {} },
                { supports: [...defaultSupports], textBlockStyleMap: { "header-one": { textBlockType: "paragraph", textBlockStyle: "huge" } } },
            );
            expect(result.content).toEqual([{ type: "paragraph", attrs: { textBlockStyle: "huge" }, content: [{ type: "text", text: "Title" }] }]);
        });

        it("keeps an empty mapped heading without inline content", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "headline450", text: "" })], entityMap: {} },
                {
                    supports: [...defaultSupports],
                    textBlockStyleMap: { headline450: { textBlockType: "heading-2", textBlockStyle: "headline450" } },
                },
            );
            expect(result.content).toEqual([{ type: "heading", attrs: { level: 2, textBlockStyle: "headline450" } }]);
        });
    });

    describe("list grouping", () => {
        it("groups consecutive unordered-list-items into a single bulletList", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unordered-list-item", text: "a" }), makeBlock({ type: "unordered-list-item", text: "b" })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toEqual([
                {
                    type: "bulletList",
                    content: [
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "a" }] }] },
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "b" }] }] },
                    ],
                },
            ]);
        });

        it("groups consecutive ordered-list-items into a single orderedList", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "ordered-list-item", text: "1" }), makeBlock({ type: "ordered-list-item", text: "2" })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].type).toBe("orderedList");
            expect(result.content?.[0].content).toHaveLength(2);
        });

        it("splits alternating ordered and unordered into separate lists", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "ordered-list-item", text: "1" }), makeBlock({ type: "unordered-list-item", text: "a" })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toHaveLength(2);
            expect(result.content?.[0].type).toBe("orderedList");
            expect(result.content?.[1].type).toBe("bulletList");
        });

        it("closes list when followed by an unstyled block", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unordered-list-item", text: "a" }), makeBlock({ type: "unstyled", text: "after" })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toHaveLength(2);
            expect(result.content?.[0].type).toBe("bulletList");
            expect(result.content?.[1].type).toBe("paragraph");
        });

        it("falls back to paragraph when list type not supported", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unordered-list-item", text: "a" })], entityMap: {} },
                { supports: [] },
            );
            expect(result.content).toEqual([{ type: "paragraph", content: [{ type: "text", text: "a" }] }]);
        });

        it("keeps a flat list when all items have depth 0", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "b", depth: 0 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            const list = result.content?.[0];
            expect(list?.content).toHaveLength(2);
            expect(list?.content?.[1].content).toEqual([{ type: "paragraph", content: [{ type: "text", text: "b" }] }]);
        });
    });

    describe("list nesting via depth", () => {
        it("nests a deeper item inside the preceding list item", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                        makeBlock({ type: "unordered-list-item", text: "b", depth: 0 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toEqual([
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
            ]);
        });

        it("groups consecutive items of the same depth into one sub-list", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                        makeBlock({ type: "unordered-list-item", text: "a.2", depth: 1 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            const subList = result.content?.[0].content?.[0].content?.[1];
            expect(subList?.type).toBe("bulletList");
            expect(subList?.content).toHaveLength(2);
        });

        it("supports multiple nesting levels", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1.1", depth: 2 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            const level1 = result.content?.[0].content?.[0].content?.[1];
            const level2 = level1?.content?.[0].content?.[1];
            expect(level2?.type).toBe("bulletList");
            expect(level2?.content?.[0].content?.[0].content).toEqual([{ type: "text", text: "a.1.1" }]);
        });

        it("closes multiple levels when returning to a shallower depth", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1.1", depth: 2 }),
                        makeBlock({ type: "unordered-list-item", text: "b", depth: 0 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            const list = result.content?.[0];
            expect(list?.content).toHaveLength(2);
            expect(list?.content?.[1].content).toEqual([{ type: "paragraph", content: [{ type: "text", text: "b" }] }]);
        });

        it("indents only one level at a time when depth jumps", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 3 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            const subList = result.content?.[0].content?.[0].content?.[1];
            expect(subList?.type).toBe("bulletList");
            expect(subList?.content?.[0].content?.[0].content).toEqual([{ type: "text", text: "a.1" }]);
        });

        it("places a leading indented item on the top level", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unordered-list-item", text: "a", depth: 2 })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toEqual([
                {
                    type: "bulletList",
                    content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "a" }] }] }],
                },
            ]);
        });

        it("starts a new sub-list when the list type changes at the same depth", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                        makeBlock({ type: "ordered-list-item", text: "a.2", depth: 1 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            const parentItem = result.content?.[0].content?.[0];
            expect(parentItem?.content?.map((node) => node.type)).toEqual(["paragraph", "bulletList", "orderedList"]);
        });

        it("nests an ordered sub-list inside an unordered list", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "ordered-list-item", text: "a.1", depth: 1 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].type).toBe("bulletList");
            expect(result.content?.[0].content?.[0].content?.[1].type).toBe("orderedList");
        });

        it("closes all levels when a non-list block follows a nested list", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                        makeBlock({ type: "unstyled", text: "after" }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content).toHaveLength(2);
            expect(result.content?.[0].type).toBe("bulletList");
            expect(result.content?.[1]).toEqual({ type: "paragraph", content: [{ type: "text", text: "after" }] });
        });

        it("limits nesting to listLevelMax", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1.1", depth: 2 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports], listLevelMax: 2 },
            );
            const subList = result.content?.[0].content?.[0].content?.[1];
            expect(subList?.content).toHaveLength(2);
            expect(subList?.content?.[1].content).toEqual([{ type: "paragraph", content: [{ type: "text", text: "a.1.1" }] }]);
        });

        it("flattens all items when listLevelMax is 1", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({ type: "unordered-list-item", text: "a", depth: 0 }),
                        makeBlock({ type: "unordered-list-item", text: "a.1", depth: 1 }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports], listLevelMax: 1 },
            );
            expect(result.content?.[0].content).toHaveLength(2);
            expect(result.content?.[0].content?.[1].content).toEqual([{ type: "paragraph", content: [{ type: "text", text: "a.1" }] }]);
        });
    });

    describe("inline style ranges", () => {
        it("maps a full-text BOLD range to a single marked text node", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "bold", inlineStyleRanges: [{ style: "BOLD", offset: 0, length: 4 }] })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "bold", marks: [{ type: "bold" }] }]);
        });

        it("splits substring BOLD into three text nodes", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "abcdef", inlineStyleRanges: [{ style: "BOLD", offset: 2, length: 2 }] })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content).toEqual([
                { type: "text", text: "ab" },
                { type: "text", text: "cd", marks: [{ type: "bold" }] },
                { type: "text", text: "ef" },
            ]);
        });

        it("handles overlapping BOLD and ITALIC", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "0123456789",
                            inlineStyleRanges: [
                                { style: "BOLD", offset: 0, length: 6 },
                                { style: "ITALIC", offset: 3, length: 5 },
                            ],
                        }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            const segments = result.content?.[0].content;
            expect(segments).toEqual([
                { type: "text", text: "012", marks: [{ type: "bold" }] },
                { type: "text", text: "345", marks: [{ type: "bold" }, { type: "italic" }] },
                { type: "text", text: "67", marks: [{ type: "italic" }] },
                { type: "text", text: "89" },
            ]);
        });

        it("maps STRIKETHROUGH to strike", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "x", inlineStyleRanges: [{ style: "STRIKETHROUGH", offset: 0, length: 1 }] })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content?.[0].marks).toEqual([{ type: "strike" }]);
        });

        it("maps SUP and SUB to superscript and subscript", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "xy",
                            inlineStyleRanges: [
                                { style: "SUP", offset: 0, length: 1 },
                                { style: "SUB", offset: 1, length: 1 },
                            ],
                        }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            const segments = result.content?.[0].content;
            expect(segments?.[0].marks).toEqual([{ type: "superscript" }]);
            expect(segments?.[1].marks).toEqual([{ type: "subscript" }]);
        });

        it("maps UNDERLINE to underline", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "x", inlineStyleRanges: [{ style: "UNDERLINE", offset: 0, length: 1 }] })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content?.[0].marks).toEqual([{ type: "underline" }]);
        });

        it("drops UNDERLINE when not in supports", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "x", inlineStyleRanges: [{ style: "UNDERLINE", offset: 0, length: 1 }] })],
                    entityMap: {},
                },
                { supports: ["bold"] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "x" }]);
        });

        it("drops unknown inline styles silently", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "x", inlineStyleRanges: [{ style: "WAT", offset: 0, length: 1 }] })],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "x" }]);
        });

        it("drops BOLD when not in supports", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "x", inlineStyleRanges: [{ style: "BOLD", offset: 0, length: 1 }] })],
                    entityMap: {},
                },
                { supports: ["italic"] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "x" }]);
        });

        it("clamps ranges that exceed text length", () => {
            expect(() =>
                convertDraftJsToTipTap(
                    {
                        blocks: [
                            makeBlock({
                                type: "unstyled",
                                text: "abc",
                                inlineStyleRanges: [{ style: "BOLD", offset: 1, length: 99 }],
                            }),
                        ],
                        entityMap: {},
                    },
                    { supports: [...defaultSupports] },
                ),
            ).not.toThrow();
        });

        it("maps a custom inline style via inlineStyleMap to an inlineStyle mark", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "hi", inlineStyleRanges: [{ style: "highlight", offset: 0, length: 2 }] })],
                    entityMap: {},
                },
                { supports: [...defaultSupports], inlineStyleMap: { highlight: "highlight" } },
            );
            expect(result.content?.[0].content).toEqual([
                { type: "text", text: "hi", marks: [{ type: "inlineStyle", attrs: { type: "highlight" } }] },
            ]);
        });

        it("maps DraftJS inline style name to a different TipTap inline style name", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "x", inlineStyleRanges: [{ style: "HIGHLIGHT", offset: 0, length: 1 }] })],
                    entityMap: {},
                },
                { supports: [...defaultSupports], inlineStyleMap: { HIGHLIGHT: "highlight" } },
            );
            expect(result.content?.[0].content).toEqual([
                { type: "text", text: "x", marks: [{ type: "inlineStyle", attrs: { type: "highlight" } }] },
            ]);
        });

        it("drops a custom inline style not present in inlineStyleMap", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [makeBlock({ type: "unstyled", text: "x", inlineStyleRanges: [{ style: "unknown-style", offset: 0, length: 1 }] })],
                    entityMap: {},
                },
                { supports: [...defaultSupports], inlineStyleMap: { highlight: "highlight" } },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "x" }]);
        });

        it("can combine a built-in mark and a custom inlineStyle mark on the same text", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "x",
                            inlineStyleRanges: [
                                { style: "BOLD", offset: 0, length: 1 },
                                { style: "highlight", offset: 0, length: 1 },
                            ],
                        }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports], inlineStyleMap: { highlight: "highlight" } },
            );
            expect(result.content?.[0].content).toEqual([
                { type: "text", text: "x", marks: [{ type: "bold" }, { type: "inlineStyle", attrs: { type: "highlight" } }] },
            ]);
        });
    });

    describe("non-breaking space and soft-hyphen splitting", () => {
        it("splits a U+00A0 character into a nonBreakingSpace atom node", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unstyled", text: "a b" })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "a" }, { type: "nonBreakingSpace" }, { type: "text", text: "b" }]);
        });

        it("splits a U+00AD character into a softHyphen atom node", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unstyled", text: "long­word" })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "long" }, { type: "softHyphen" }, { type: "text", text: "word" }]);
        });

        it("preserves marks on text fragments adjacent to atom characters", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "a b",
                            inlineStyleRanges: [{ style: "BOLD", offset: 0, length: 3 }],
                        }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content).toEqual([
                { type: "text", text: "a", marks: [{ type: "bold" }] },
                { type: "nonBreakingSpace" },
                { type: "text", text: "b", marks: [{ type: "bold" }] },
            ]);
        });

        it("handles consecutive and mixed atom characters", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unstyled", text: "a ­b" })], entityMap: {} },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content).toEqual([
                { type: "text", text: "a" },
                { type: "nonBreakingSpace" },
                { type: "softHyphen" },
                { type: "text", text: "b" },
            ]);
        });

        it("keeps atom characters as plain text when feature is not in supports", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unstyled", text: "a b­c" })], entityMap: {} },
                { supports: ["bold"] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "a b­c" }]);
        });

        it("splits only the supported atom character when one of the two is disabled", () => {
            const result = convertDraftJsToTipTap(
                { blocks: [makeBlock({ type: "unstyled", text: "a b­c" })], entityMap: {} },
                { supports: ["non-breaking-space"] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "a" }, { type: "nonBreakingSpace" }, { type: "text", text: "b­c" }]);
        });
    });

    describe("link entities", () => {
        it("emits a link mark for a LINK entity when link block is provided", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "click",
                            entityRanges: [{ key: 0, offset: 0, length: 5 }],
                        }),
                    ],
                    entityMap: { "0": { type: "LINK", mutability: "MUTABLE", data: { href: "https://example.com" } } },
                },
                { supports: [...defaultSupports], link: dummyLinkBlock },
            );
            expect(result.content?.[0].content).toEqual([
                { type: "text", text: "click", marks: [{ type: "link", attrs: { data: { href: "https://example.com" } } }] },
            ]);
        });

        it("does not emit link mark when no link block is provided", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "click",
                            entityRanges: [{ key: 0, offset: 0, length: 5 }],
                        }),
                    ],
                    entityMap: { "0": { type: "LINK", mutability: "MUTABLE", data: { href: "https://example.com" } } },
                },
                { supports: [...defaultSupports] },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "click" }]);
        });

        it("handles multiple link entities in one block", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "a b c",
                            entityRanges: [
                                { key: 0, offset: 0, length: 1 },
                                { key: 1, offset: 4, length: 1 },
                            ],
                        }),
                    ],
                    entityMap: {
                        "0": { type: "LINK", mutability: "MUTABLE", data: { href: "https://a.com" } },
                        "1": { type: "LINK", mutability: "MUTABLE", data: { href: "https://c.com" } },
                    },
                },
                { supports: [...defaultSupports], link: dummyLinkBlock },
            );
            const segments = result.content?.[0].content;
            expect(segments?.[0].marks).toEqual([{ type: "link", attrs: { data: { href: "https://a.com" } } }]);
            expect(segments?.[segments.length - 1].marks).toEqual([{ type: "link", attrs: { data: { href: "https://c.com" } } }]);
        });

        it("combines link mark with bold mark on overlapping range", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "bold-link",
                            inlineStyleRanges: [{ style: "BOLD", offset: 0, length: 9 }],
                            entityRanges: [{ key: 0, offset: 0, length: 9 }],
                        }),
                    ],
                    entityMap: { "0": { type: "LINK", mutability: "MUTABLE", data: { href: "https://x.com" } } },
                },
                { supports: [...defaultSupports], link: dummyLinkBlock },
            );
            const marks = result.content?.[0].content?.[0].marks;
            expect(marks).toEqual([{ type: "bold" }, { type: "link", attrs: { data: { href: "https://x.com" } } }]);
        });

        it("ignores non-LINK entities", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "x",
                            entityRanges: [{ key: 0, offset: 0, length: 1 }],
                        }),
                    ],
                    entityMap: { "0": { type: "IMAGE", mutability: "IMMUTABLE", data: {} } },
                },
                { supports: [...defaultSupports], link: dummyLinkBlock },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "x" }]);
        });

        it("handles a missing entityMap key without crashing", () => {
            const result = convertDraftJsToTipTap(
                {
                    blocks: [
                        makeBlock({
                            type: "unstyled",
                            text: "x",
                            entityRanges: [{ key: 5, offset: 0, length: 1 }],
                        }),
                    ],
                    entityMap: {},
                },
                { supports: [...defaultSupports], link: dummyLinkBlock },
            );
            expect(result.content?.[0].content).toEqual([{ type: "text", text: "x" }]);
        });
    });
});

describe("buildStrippedTipTapDoc", () => {
    it("returns minimal doc for empty input", () => {
        expect(buildStrippedTipTapDoc({ blocks: [], entityMap: {} })).toEqual({
            type: "doc",
            content: [{ type: "paragraph" }],
        });
    });

    it("emits one paragraph per block with plain text only", () => {
        const result = buildStrippedTipTapDoc({
            blocks: [
                makeBlock({
                    type: "header-one",
                    text: "Hi",
                    inlineStyleRanges: [{ style: "BOLD", offset: 0, length: 2 }],
                }),
                makeBlock({ type: "unordered-list-item", text: "item" }),
            ],
            entityMap: {},
        });
        expect(result).toEqual({
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "Hi" }] },
                { type: "paragraph", content: [{ type: "text", text: "item" }] },
            ],
        });
    });

    it("emits empty paragraphs for empty text blocks", () => {
        const result = buildStrippedTipTapDoc({
            blocks: [makeBlock({ type: "unstyled", text: "" })],
            entityMap: {},
        });
        expect(result.content).toEqual([{ type: "paragraph" }]);
    });
});
