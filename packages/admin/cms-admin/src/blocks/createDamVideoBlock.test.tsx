import { describe, expect, it } from "vitest";

import { createDamVideoBlock } from "./createDamVideoBlock";

describe("createDamVideoBlock", () => {
    it("should create a block named DamVideo", () => {
        expect(createDamVideoBlock().name).toBe("DamVideo");
    });

    it("should allow overriding the tags", () => {
        expect(createDamVideoBlock({ tags: ["Movie"] }).tags).toEqual(["Movie"]);
    });

    it("should allow overriding the block", () => {
        const block = createDamVideoBlock({}, (block) => ({ ...block, name: "MyCustomDamVideo" }));

        expect(block.name).toBe("MyCustomDamVideo");
    });
});
