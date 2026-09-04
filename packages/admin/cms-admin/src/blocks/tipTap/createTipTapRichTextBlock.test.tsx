import { describe, expect, it } from "vitest";

import { createTipTapRichTextBlock } from "./createTipTapRichTextBlock";

describe("createTipTapRichTextBlock", () => {
    it("should throw for invalid heading levels instead of silently creating a broken heading", () => {
        expect(() => createTipTapRichTextBlock({ heading: { levels: [] } })).toThrow();
        expect(() => createTipTapRichTextBlock({ heading: { levels: [0, 2, 3] } })).toThrow();
        expect(() => createTipTapRichTextBlock({ heading: { levels: [1, 7] } })).toThrow();
        expect(() => createTipTapRichTextBlock({ heading: { levels: [1, 1, 2] } })).toThrow();
        expect(() => createTipTapRichTextBlock({ heading: { levels: [1.5, 2] } })).toThrow();
    });
});
