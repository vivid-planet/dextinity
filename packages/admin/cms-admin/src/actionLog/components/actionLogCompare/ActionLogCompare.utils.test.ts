import { describe, expect, it } from "vitest";

import { defaultFilterOutKeys, filterOutKeys } from "./ActionLogCompare.utils";

describe("filterOutKeys", () => {
    it("removes a specified key from a flat object", () => {
        const result = filterOutKeys({ id: 1, title: "Page", createdAt: "2024-01-01" }, ["createdAt"]);

        expect(result).toEqual({ id: 1, title: "Page" });
    });

    it("removes multiple keys", () => {
        const result = filterOutKeys({ id: 1, title: "Page", createdAt: "2024-01-01", updatedAt: "2024-01-02" }, ["createdAt", "updatedAt"]);

        expect(result).toEqual({ id: 1, title: "Page" });
    });

    it("removes keys recursively from nested objects", () => {
        const result = filterOutKeys(
            {
                id: 1,
                createdAt: "2024-01-01",
                author: { id: 2, name: "Alice", createdAt: "2023-01-01" },
            },
            ["createdAt"],
        );

        expect(result).toEqual({
            id: 1,
            author: { id: 2, name: "Alice" },
        });
    });

    it("removes keys from objects inside arrays", () => {
        const result = filterOutKeys(
            {
                items: [
                    { id: 1, createdAt: "2024-01-01" },
                    { id: 2, createdAt: "2024-01-02" },
                ],
            },
            ["createdAt"],
        );

        expect(result).toEqual({
            items: [{ id: 1 }, { id: 2 }],
        });
    });

    it("walks deeply nested mixes of objects and arrays", () => {
        const result = filterOutKeys(
            {
                page: {
                    blocks: [
                        { type: "text", content: "hi", createdAt: "x" },
                        { type: "list", items: [{ label: "a", createdAt: "y" }] },
                    ],
                    createdAt: "z",
                },
            },
            ["createdAt"],
        );

        expect(result).toEqual({
            page: {
                blocks: [
                    { type: "text", content: "hi" },
                    { type: "list", items: [{ label: "a" }] },
                ],
            },
        });
    });

    it("leaves primitives unchanged", () => {
        expect(filterOutKeys("hello", ["createdAt"])).toBe("hello");
        expect(filterOutKeys(42, ["createdAt"])).toBe(42);
        expect(filterOutKeys(true, ["createdAt"])).toBe(true);
        expect(filterOutKeys(null, ["createdAt"])).toBe(null);
    });

    it("preserves empty objects and arrays", () => {
        expect(filterOutKeys({}, ["createdAt"])).toEqual({});
        expect(filterOutKeys([], ["createdAt"])).toEqual([]);
    });

    it("returns the input unchanged when no keys match", () => {
        const input = { id: 1, title: "Page", nested: { value: 2 } };

        expect(filterOutKeys(input, ["nonExistent"])).toEqual(input);
    });

    it("does not mutate the input", () => {
        const input = { id: 1, createdAt: "2024-01-01", nested: { createdAt: "x" } };
        const snapshot = JSON.parse(JSON.stringify(input));

        filterOutKeys(input, ["createdAt"]);

        expect(input).toEqual(snapshot);
    });

    it("removes the default keys (createdAt, updatedAt)", () => {
        const result = filterOutKeys({ id: 1, title: "Page", createdAt: "x", updatedAt: "y" }, defaultFilterOutKeys);

        expect(result).toEqual({ id: 1, title: "Page" });
    });
});
