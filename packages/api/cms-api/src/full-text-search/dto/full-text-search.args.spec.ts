import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { FullTextSearchArgs } from "./full-text-search.args";

async function validationErrors(args: Record<string, unknown>) {
    const errors = await validate(plainToInstance(FullTextSearchArgs, { search: "fox", offset: 0, limit: 25, ...args }));
    return errors.map((error) => error.property);
}

describe("FullTextSearchArgs", () => {
    it("accepts valid arguments", async () => {
        expect(await validationErrors({ types: ["Page", "News"], scope: { domain: "main" } })).toEqual([]);
    });

    it("rejects more than 50 types", async () => {
        expect(await validationErrors({ types: Array.from({ length: 51 }, (_, index) => `Type${index}`) })).toEqual(["types"]);
    });

    it("rejects types that aren't strings", async () => {
        expect(await validationErrors({ types: ["Page", 1] })).toEqual(["types"]);
    });

    it("rejects a search longer than 200 characters", async () => {
        expect(await validationErrors({ search: "a".repeat(201) })).toEqual(["search"]);
    });

    it("rejects a limit above 50", async () => {
        expect(await validationErrors({ limit: 51 })).toEqual(["limit"]);
    });
});
