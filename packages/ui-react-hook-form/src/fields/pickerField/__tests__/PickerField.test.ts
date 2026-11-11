import { describe, expect, it } from "vitest";

import { toPickerValue } from "../PickerField";

describe("toPickerValue", () => {
    it("maps an empty form value to nothing chosen", () => {
        expect(toPickerValue(undefined)).toBeNull();
        expect(toPickerValue("")).toBeNull();
    });

    it("keeps a chosen value", () => {
        const page = { id: "about" };
        expect(toPickerValue(page)).toBe(page);
        expect(toPickerValue([page])).toEqual([page]);
    });
});
