import { describe, expect, it } from "vitest";

import { stringToUuid } from "./string-to-uuid";

describe("stringToUuid", () => {
    it.each([
        ["", "da39a3ee-5e6b-5b0d-b255-bfef95601890"],
        ["hello", "aaf4c61d-dcc5-58a2-9abe-de0f3b482cd9"],
        [JSON.stringify({ permission: "pageTree", contentScopes: [{ domain: "main", language: "de" }] }), "8495fa59-0d2b-50df-ba35-24d909821dfd"],
        ["Größe – 日本語 🎉", "f920a804-6af2-5c73-8dba-9cf9549a8f6c"],
    ])("returns the same UUID as uuid-by-string for %j", (value, expected) => {
        expect(stringToUuid(value)).toBe(expected);
    });
});
