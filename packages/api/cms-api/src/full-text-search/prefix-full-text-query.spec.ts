import { describe, expect, it } from "vitest";

import { searchToPrefixTsQuery } from "./prefix-full-text-query";

describe("searchToPrefixTsQuery", () => {
    it("matches each word as a prefix", () => {
        expect(searchToPrefixTsQuery("Navig")).toBe("navig:*");
        expect(searchToPrefixTsQuery("Audi  Navig")).toBe("audi:* & navig:*");
    });

    it("drops tsquery operators and punctuation", () => {
        expect(searchToPrefixTsQuery("a & b | !c:*")).toBe("a:* & b:* & c:*");
        expect(searchToPrefixTsQuery("e-tron")).toBe("e:* & tron:*");
    });

    it("keeps letters outside of ASCII", () => {
        expect(searchToPrefixTsQuery("Größe")).toBe("größe:*");
    });

    it("returns undefined when there is nothing to search for", () => {
        expect(searchToPrefixTsQuery("")).toBeUndefined();
        expect(searchToPrefixTsQuery(" &|! ")).toBeUndefined();
    });
});
