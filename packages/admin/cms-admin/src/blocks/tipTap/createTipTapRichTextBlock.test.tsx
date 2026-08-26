import { describe, expect, it } from "vitest";

import { createTipTapRichTextBlock } from "./createTipTapRichTextBlock";

describe("createTipTapRichTextBlock", () => {
    it("should throw for invalid headingLevels instead of silently creating a broken heading", () => {
        expect(() => createTipTapRichTextBlock({ headingLevels: [] })).toThrow();
        expect(() => createTipTapRichTextBlock({ headingLevels: [0, 2, 3] })).toThrow();
        expect(() => createTipTapRichTextBlock({ headingLevels: [1, 7] })).toThrow();
        expect(() => createTipTapRichTextBlock({ headingLevels: [1, 1, 2] })).toThrow();
        expect(() => createTipTapRichTextBlock({ headingLevels: [1.5, 2] })).toThrow();
    });

    it("should throw when defaultHeadingLevel is not one of the headingLevels", () => {
        expect(() => createTipTapRichTextBlock({ headingLevels: [2, 3, 4], defaultHeadingLevel: 1 })).toThrow();
        expect(() => createTipTapRichTextBlock({ defaultHeadingLevel: 7 })).toThrow();
    });

    it("should throw when paragraphs are disabled and no other text block type is left", () => {
        expect(() => createTipTapRichTextBlock({ supports: ["bold"], allowParagraph: false })).toThrow();
    });

    it("should throw when paragraphs are disabled together with list support", () => {
        expect(() => createTipTapRichTextBlock({ supports: ["heading", "unordered-list"], allowParagraph: false })).toThrow();
        expect(() => createTipTapRichTextBlock({ supports: ["heading", "ordered-list"], allowParagraph: false })).toThrow();
    });

    it("should start heading-only content with a heading of the default level", () => {
        const block = createTipTapRichTextBlock({ supports: ["heading"], headingLevels: [2, 3, 4], defaultHeadingLevel: 3, allowParagraph: false });
        expect(block.defaultValues()).toEqual({ tipTapContent: { type: "doc", content: [{ type: "heading", attrs: { level: 3 } }] } });
    });
});
