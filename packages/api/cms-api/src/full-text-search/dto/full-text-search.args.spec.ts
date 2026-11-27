import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { FullTextSearchArgs } from "./full-text-search.args.js";

describe("FullTextSearchArgs", () => {
    it.each([
        { args: { scope: { domain: "main" } }, invalidProperties: [] },
        { args: { search: "a".repeat(201) }, invalidProperties: ["search"] },
        { args: { scope: "main" }, invalidProperties: ["scope"] },
        { args: { types: ["Page", "News"] }, invalidProperties: [] },
        { args: { types: "Page" }, invalidProperties: ["types"] },
        { args: { types: ["a".repeat(101)] }, invalidProperties: ["types"] },
        { args: { limit: 51 }, invalidProperties: ["limit"] },
        { args: { offset: -1 }, invalidProperties: ["offset"] },
    ])("validates $args", async ({ args, invalidProperties }) => {
        const errors = await validate(plainToInstance(FullTextSearchArgs, { search: "fox", offset: 0, limit: 25, ...args }));

        expect(errors.map((error) => error.property)).toEqual(invalidProperties);
    });
});
