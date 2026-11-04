import { describe, expect, it } from "vitest";

import { parallelAsyncEvery } from "../parallelAsyncEvery";

describe("parallelAsyncEvery", () => {
    it("should return true when all synchronous predicates return true", async () => {
        const result = await parallelAsyncEvery([1, 2, 3], () => true);
        expect(result).toBe(true);
    });

    it("should return false when any synchronous predicate returns false", async () => {
        const result = await parallelAsyncEvery([1, 2, 3], (n) => n < 3);
        expect(result).toBe(false);
    });

    it("should return true for an empty array", async () => {
        const result = await parallelAsyncEvery([], () => false);
        expect(result).toBe(true);
    });

    it("should return true when all async predicates resolve to true", async () => {
        const result = await parallelAsyncEvery([1, 2, 3], () => Promise.resolve(true));
        expect(result).toBe(true);
    });

    it("should return false when any async predicate resolves to false", async () => {
        const result = await parallelAsyncEvery([1, 2, 3], (n) => Promise.resolve(n !== 2));
        expect(result).toBe(false);
    });

    it("should handle a mix of synchronous and async predicates", async () => {
        const predicate = (n: number) => (n === 1 ? Promise.resolve(true) : true);
        const result = await parallelAsyncEvery([1, 2], predicate);
        expect(result).toBe(true);
    });

    it("should return false when a predicate returns a truthy non-boolean value", async () => {
        // The implementation uses `=== true`, so truthy values like 1 are not accepted
        const result = await parallelAsyncEvery([1], () => 1 as unknown as boolean);
        expect(result).toBe(false);
    });

    it("should call the predicate for every item", async () => {
        const seen: number[] = [];
        await parallelAsyncEvery([10, 20, 30], (n) => {
            seen.push(n);
            return true;
        });
        expect(seen).toEqual([10, 20, 30]);
    });
});
