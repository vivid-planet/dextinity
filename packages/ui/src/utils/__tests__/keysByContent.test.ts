import { describe, expect, it } from "vitest";

import { keysByContent } from "../keysByContent";

describe("keysByContent", () => {
    it("tells repeated content apart by its occurrence", () => {
        expect(keysByContent(["a", "b", "a", "a"])).toStrictEqual(["1:a", "1:b", "2:a", "3:a"]);
    });

    it("keeps the keys of earlier items when items are appended", () => {
        expect(keysByContent(["x", "y", "x", "y"]).slice(0, 3)).toStrictEqual(keysByContent(["x", "y", "x"]));
    });

    it("doesn't confuse content that looks like a key with a repeated item", () => {
        const keys = keysByContent(["a", "1:a", "a"]);

        expect(new Set(keys).size).toBe(3);
    });
});
