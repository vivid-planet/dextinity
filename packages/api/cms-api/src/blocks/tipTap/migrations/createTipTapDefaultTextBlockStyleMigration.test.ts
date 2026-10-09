import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";

import { createTipTapRichTextBlock } from "../createTipTapRichTextBlock";
import { createTipTapDefaultTextBlockStyleMigration } from "./createTipTapDefaultTextBlockStyleMigration";

const listStyles = { styles: [{ name: "list300" }, { name: "list200" }] };

const block = createTipTapRichTextBlock(
    {
        textBlocks: [
            { name: "paragraph", tag: "p", styles: [{ name: "copy300" }, { name: "copy200" }] },
            { name: "heading-2", tag: "h2", styles: [{ name: "headline400" }] },
            { name: "heading-3", tag: "h3", styles: [{ name: "headline300" }] },
        ],
        orderedList: listStyles,
        unorderedList: listStyles,
    },
    {
        name: "TestDefaultTextBlockStyleMigration",
        migrate: {
            version: 1,
            migrations: [
                createTipTapDefaultTextBlockStyleMigration({
                    toVersion: 1,
                    defaultTextBlock: "paragraph",
                    textBlocks: { paragraph: "copy300", "heading-2": "headline400" },
                    unorderedList: "list300",
                }),
            ],
        },
    },
);

function textBlock(attrs: Record<string, unknown>): JSONContent {
    return { type: "textBlock", attrs, content: [{ type: "text", text: "Text" }] };
}

function read(content: JSONContent[], version?: number): JSONContent[] | undefined {
    return block.blockDataFactory({ tipTapContent: { type: "doc", content }, ...(version !== undefined ? { $$version: version } : {}) }).tipTapContent
        .content;
}

describe("createTipTapDefaultTextBlockStyleMigration", () => {
    it("gives a text block without a style the default style of its text block", () => {
        expect(read([textBlock({ textBlock: "paragraph" }), textBlock({ textBlock: "heading-2", textBlockStyle: null })])).toEqual([
            textBlock({ textBlock: "paragraph", textBlockStyle: "copy300" }),
            textBlock({ textBlock: "heading-2", textBlockStyle: "headline400" }),
        ]);
    });

    it("keeps a style the content carries", () => {
        expect(read([textBlock({ textBlock: "paragraph", textBlockStyle: "copy200" })])).toEqual([
            textBlock({ textBlock: "paragraph", textBlockStyle: "copy200" }),
        ]);
    });

    it("gives a node naming no text block the default style of the default text block", () => {
        expect(read([{ type: "textBlock", content: [{ type: "text", text: "Text" }] }])).toEqual([textBlock({ textBlockStyle: "copy300" })]);
    });

    it("leaves a text block without a default style unstyled", () => {
        expect(read([textBlock({ textBlock: "heading-3" })])).toEqual([textBlock({ textBlock: "heading-3" })]);
    });

    it("gives a list item the default style of its innermost list rather than of its text block", () => {
        expect(
            read([
                {
                    type: "orderedList",
                    content: [
                        {
                            type: "listItem",
                            content: [
                                textBlock({ textBlock: "paragraph" }),
                                { type: "bulletList", content: [{ type: "listItem", content: [textBlock({ textBlock: "paragraph" })] }] },
                            ],
                        },
                    ],
                },
            ]),
        ).toEqual([
            {
                type: "orderedList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            // No default style is given for the ordered list, and inside it the text block's doesn't apply.
                            textBlock({ textBlock: "paragraph" }),
                            {
                                type: "bulletList",
                                content: [{ type: "listItem", content: [textBlock({ textBlock: "paragraph", textBlockStyle: "list300" })] }],
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it("leaves content that already has the migration's version untouched", () => {
        expect(read([textBlock({ textBlock: "paragraph" })], 1)).toEqual([textBlock({ textBlock: "paragraph" })]);
    });
});
