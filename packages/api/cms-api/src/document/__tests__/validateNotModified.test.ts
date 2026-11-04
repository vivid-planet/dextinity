import { describe, expect, it } from "vitest";

import { validateNotModified } from "../validateNotModified";

describe("validateNotModified", () => {
    it("should succeed - document not modified", async () => {
        expect(() => {
            validateNotModified(
                {
                    id: "1234",
                    updatedAt: new Date(2024, 1, 31),
                },
                new Date(2024, 1, 31),
            );
        }).not.toThrow();
    });

    it("should throw error because document got modified", async () => {
        expect(() => {
            validateNotModified(
                {
                    id: "1234",
                    updatedAt: new Date(2024, 1, 31, 8, 30, 1),
                },
                new Date(2024, 1, 31, 8, 30, 0),
            );
        }).toThrowError("Conflict: Document has been modified.");
    });

    it("should should succeed - invalid lastUpdatedAt", async () => {
        expect(() => {
            validateNotModified(
                {
                    id: "1234",
                    updatedAt: new Date(2024, 1, 31, 8, 30, 1),
                },
                new Date("invalid"),
            );
        }).not.toThrow();
    });
});
