import { afterEach, describe, expect, it, vi } from "vitest";

import { getLabelOffset, getRenderedFrameRect } from "../frameElements";

function mockRect(element: Element, rect: { top: number; left: number; width: number; height: number }) {
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({ ...rect, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => rect });
}

function mockContentsRect(rect: { top: number; left: number; width: number; height: number }) {
    const range = document.createRange();
    vi.spyOn(range, "selectNodeContents").mockImplementation(() => undefined);
    Object.assign(range, { getBoundingClientRect: () => ({ ...rect, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => rect }) });
    vi.spyOn(document, "createRange").mockReturnValue(range);
}

describe("getRenderedFrameRect", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("measures an element by its own box", () => {
        const element = document.createElement("div");
        mockRect(element, { top: 10, left: 20, width: 30, height: 40 });
        expect(getRenderedFrameRect(element)).toEqual({ top: 10, left: 20, width: 30, height: 40 });
    });

    it("measures an element without a box of its own, e.g. with `display: contents`, by its contents", () => {
        const element = document.createElement("div");
        mockRect(element, { top: 0, left: 0, width: 0, height: 0 });
        mockContentsRect({ top: 5, left: 6, width: 70, height: 20 });
        expect(getRenderedFrameRect(element)).toEqual({ top: 5, left: 6, width: 70, height: 20 });
    });

    it("is null when neither the element nor its contents have a size", () => {
        const element = document.createElement("div");
        mockRect(element, { top: 0, left: 0, width: 0, height: 0 });
        mockContentsRect({ top: 0, left: 0, width: 0, height: 0 });
        expect(getRenderedFrameRect(element)).toBeNull();
    });
});

describe("getLabelOffset", () => {
    it("keeps the preferred offset while the label fits", () => {
        expect(getLabelOffset({ preferredOffset: -2, anchorLeft: 100, labelWidth: 200, frameWidth: 400 })).toBe(-2);
    });

    it("moves the label left to end at the frame's right edge", () => {
        expect(getLabelOffset({ preferredOffset: -2, anchorLeft: 300, labelWidth: 200, frameWidth: 400 })).toBe(-100);
    });

    it("keeps the label's start inside the frame", () => {
        expect(getLabelOffset({ preferredOffset: -2, anchorLeft: 1, labelWidth: 100, frameWidth: 400 })).toBe(-1);
        expect(getLabelOffset({ preferredOffset: -2, anchorLeft: 50, labelWidth: 500, frameWidth: 400 })).toBe(-50);
    });
});
