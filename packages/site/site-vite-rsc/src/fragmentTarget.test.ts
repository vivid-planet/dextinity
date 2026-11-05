import { afterEach, describe, expect, it } from "vitest";

import { getFragmentTarget } from "./fragmentTarget.js";

function addElement(id: string) {
    const element = document.createElement("div");
    element.id = id;
    document.body.append(element);
    return element;
}

describe("getFragmentTarget", () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it("finds the element by the decoded fragment", () => {
        const element = addElement("über uns");

        expect(getFragmentTarget("%C3%BCber%20uns")).toBe(element);
    });

    it("finds ids with a literal percent sign", () => {
        const element = addElement("100%");

        expect(getFragmentTarget("100%")).toBe(element);
    });

    it("returns null for unknown or malformed fragments", () => {
        expect(getFragmentTarget("missing")).toBeNull();
        expect(getFragmentTarget("50%off")).toBeNull();
    });
});
