import { describe, expect, it } from "vitest";

import { isEmptyRichText } from "./RichTextEditorField";

describe("isEmptyRichText", () => {
    it("treats markup without visible text as empty", () => {
        expect(isEmptyRichText(undefined)).toBe(true);
        expect(isEmptyRichText("")).toBe(true);
        expect(isEmptyRichText("<p><br></p>")).toBe(true);
        expect(isEmptyRichText("<p>&nbsp;</p>")).toBe(true);
    });

    it("treats text as a value", () => {
        expect(isEmptyRichText("<p>Hello</p>")).toBe(false);
    });
});
