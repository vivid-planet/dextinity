import { describe, expect, it } from "vitest";

import { BlockData, type BlockDataInterface, BlockInput, blockInputToData, createBlock } from "./block";
import { getBlocksMeta } from "./blocks-meta";

class MetaTestBlockData extends BlockData {}

class MetaTestBlockInput extends BlockInput {
    transformToBlockData(): BlockDataInterface {
        return blockInputToData(MetaTestBlockData, this);
    }
}

describe("getBlocksMeta", () => {
    it("should include the description of a block", () => {
        createBlock(MetaTestBlockData, MetaTestBlockInput, {
            name: "BlocksMetaDescriptionTest",
            description: "A block that exists to be described.",
        });

        const meta = getBlocksMeta().find((block) => block.name === "BlocksMetaDescriptionTest");

        expect(meta?.description).toBe("A block that exists to be described.");
    });
});
