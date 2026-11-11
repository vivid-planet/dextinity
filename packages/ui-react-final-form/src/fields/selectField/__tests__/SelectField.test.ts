import { describe, expect, it } from "vitest";

import { toSelectValue } from "../SelectField";

describe("toSelectValue", () => {
    it("maps an empty form value to nothing chosen", () => {
        expect(toSelectValue(undefined, false)).toBeNull();
        expect(toSelectValue("", false)).toBeNull();
        expect(toSelectValue(undefined, true)).toEqual([]);
        expect(toSelectValue("", true)).toEqual([]);
    });

    it("keeps a value of the matching shape", () => {
        expect(toSelectValue("news", false)).toBe("news");
        expect(toSelectValue(["news", "blog"], true)).toEqual(["news", "blog"]);
    });

    it("wraps a single value in a list for multiple", () => {
        expect(toSelectValue("news", true)).toEqual(["news"]);
    });
});
