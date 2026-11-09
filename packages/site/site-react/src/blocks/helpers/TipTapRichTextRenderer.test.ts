import { describe, expect, it } from "vitest";

import { hasTipTapRichTextContent, type TipTapNode } from "./TipTapRichTextRenderer";

const doc = (...content: TipTapNode[]): TipTapNode => ({ type: "doc", content });
const textBlock = (...content: TipTapNode[]): TipTapNode => ({ type: "textBlock", content });
const listItem = (...content: TipTapNode[]): TipTapNode => ({ type: "listItem", content });
const text = (value: string): TipTapNode => ({ type: "text", text: value });

describe("hasTipTapRichTextContent", () => {
    it("returns false for undefined content", () => {
        expect(hasTipTapRichTextContent(undefined)).toBe(false);
    });

    it("returns false for an empty text block", () => {
        expect(hasTipTapRichTextContent(doc({ type: "textBlock" }))).toBe(false);
    });

    it("returns true for a text block with text", () => {
        expect(hasTipTapRichTextContent(doc(textBlock(text("Hello"))))).toBe(true);
    });

    it("returns false for an empty ordered list", () => {
        expect(hasTipTapRichTextContent(doc({ type: "orderedList", content: [listItem({ type: "textBlock" })] }))).toBe(false);
    });

    it("returns false for an empty bullet list", () => {
        expect(hasTipTapRichTextContent(doc({ type: "bulletList", content: [listItem(textBlock())] }))).toBe(false);
    });

    it("returns true for a list with text", () => {
        expect(hasTipTapRichTextContent(doc({ type: "orderedList", content: [listItem(textBlock()), listItem(textBlock(text("Hello")))] }))).toBe(
            true,
        );
    });

    it("returns true for a text block with only a hard break", () => {
        expect(hasTipTapRichTextContent(doc(textBlock({ type: "hardBreak" })))).toBe(true);
    });

    it("returns true for a node that isn't a text block or a list", () => {
        expect(hasTipTapRichTextContent(doc({ type: "image" }))).toBe(true);
    });
});
