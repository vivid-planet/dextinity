import { describe, expect, it } from "vitest";

import { hasRenderableContent } from "./hasRenderableContent";

describe("hasRenderableContent", () => {
    it.each([
        ["null", null],
        ["undefined", undefined],
        ["false", false],
        ["an empty string", ""],
        ["an array of nothing", [null, false, ""]],
    ])("is false for %s", (_, node) => {
        expect(hasRenderableContent(node)).toBe(false);
    });

    it.each([
        ["text", "Label"],
        ["zero", 0],
        ["an element", <span key="element" />],
        ["an array with one element", [null, <span key="element" />]],
    ])("is true for %s", (_, node) => {
        expect(hasRenderableContent(node)).toBe(true);
    });
});
