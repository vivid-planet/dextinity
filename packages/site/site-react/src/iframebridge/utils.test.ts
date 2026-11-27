import { describe, expect, it } from "vitest";

import { getCombinedPositioningOfElements, removePreviewElementFromList } from "./utils";

it("removes only the copy that unmounted when copies share a route", () => {
    const firstCopy = { adminRoute: "cell", label: "Cell", element: document.createElement("div") };
    const secondCopy = { adminRoute: "cell", label: "Cell", element: document.createElement("div") };

    expect(removePreviewElementFromList([firstCopy, secondCopy], secondCopy)).toEqual([firstCopy]);
});

function createElementWithBox({ top, left, width, height }: { top: number; left: number; width: number; height: number }) {
    const element = document.createElement("div");
    const box = { top, left, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => undefined };
    element.getBoundingClientRect = () => box;
    element.getClientRects = () => [box] as unknown as DOMRectList;

    return element;
}

describe("getCombinedPositioningOfElements", () => {
    it("returns the area around all elements", () => {
        const firstParagraph = createElementWithBox({ top: 100, left: 20, width: 280, height: 40 });
        const secondParagraph = createElementWithBox({ top: 140, left: 20, width: 280, height: 60 });

        expect(getCombinedPositioningOfElements([firstParagraph, secondParagraph])).toEqual({ top: 100, left: 20, width: 280, height: 100 });
    });

    it("ignores elements without a box, such as one with display: none", () => {
        const visibleElement = createElementWithBox({ top: 100, left: 20, width: 280, height: 40 });
        const hiddenElement = document.createElement("div");

        expect(getCombinedPositioningOfElements([hiddenElement, visibleElement])).toEqual({ top: 100, left: 20, width: 280, height: 40 });
    });

    it("returns null when no element has a box", () => {
        expect(getCombinedPositioningOfElements([document.createElement("div")])).toBeNull();
    });
});
