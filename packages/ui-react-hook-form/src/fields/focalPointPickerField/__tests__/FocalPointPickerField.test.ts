import { describe, expect, it } from "vitest";

import { toFocalPoint } from "../FocalPointPickerField";

describe("toFocalPoint", () => {
    it("rests in the center without a value", () => {
        expect(toFocalPoint(undefined)).toEqual({ x: 0.5, y: 0.5 });
        expect(toFocalPoint("")).toEqual({ x: 0.5, y: 0.5 });
    });

    it("keeps a focal point", () => {
        expect(toFocalPoint({ x: 0.2, y: 0.8 })).toEqual({ x: 0.2, y: 0.8 });
    });
});
