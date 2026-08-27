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
});
