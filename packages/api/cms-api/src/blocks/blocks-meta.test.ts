import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../page-tree/blocks/internal-link.block";
import { BlockData, type BlockDataInterface, BlockInput, blockInputToData, createBlock } from "./block";
import { getBlocksMeta } from "./blocks-meta";
import { ExternalLinkBlock } from "./externalLink/external-link.block";
import { createBlocksBlock } from "./factories/createBlocksBlock";
import { createLinkBlock } from "./factories/createLinkBlock";
import { createListBlock } from "./factories/createListBlock";
import { createOneOfBlock } from "./factories/createOneOfBlock";
import { createOptionalBlock } from "./factories/createOptionalBlock";

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

    describe("default descriptions of block factories", () => {
        const supportedBlocks = { internal: InternalLinkBlock, external: ExternalLinkBlock };

        function getDescription(name: string) {
            return getBlocksMeta().find((block) => block.name === name)?.description;
        }

        it("should describe an empty one-of block if empty is allowed", () => {
            createOneOfBlock({ supportedBlocks }, "OneOfDescriptionTest");

            expect(getDescription("OneOfDescriptionTest")).toContain("an entry with that `type` must be in the list");
            expect(getDescription("OneOfDescriptionTest")).toContain("`activeType` `null` means the block is empty");
        });

        it("should describe a link block that can't be empty", () => {
            createLinkBlock({ supportedBlocks }, "LinkDescriptionTest");

            expect(getDescription("LinkDescriptionTest")).toMatch(/^A link to one of several targets\./);
            expect(getDescription("LinkDescriptionTest")).toContain("`activeType` must be set");
        });

        it("should describe list, blocks and optional blocks", () => {
            createListBlock({ block: ExternalLinkBlock }, "ListDescriptionTest");
            createBlocksBlock({ supportedBlocks }, "BlocksDescriptionTest");
            createOptionalBlock(ExternalLinkBlock, "OptionalDescriptionTest");

            expect(getDescription("ListDescriptionTest")).toContain("unique `key`");
            expect(getDescription("BlocksDescriptionTest")).toContain("unique `key`");
            expect(getDescription("OptionalDescriptionTest")).toContain('`{"visible":false}`');
        });

        it("should prefer the description passed as options", () => {
            createOneOfBlock({ supportedBlocks }, { name: "OneOfOwnDescriptionTest", description: "A project's own description." });
            createLinkBlock({ supportedBlocks }, { name: "LinkOwnDescriptionTest", description: "A project's own description." });
            createListBlock({ block: ExternalLinkBlock }, { name: "ListOwnDescriptionTest", description: "A project's own description." });

            expect(getDescription("OneOfOwnDescriptionTest")).toBe("A project's own description.");
            expect(getDescription("LinkOwnDescriptionTest")).toBe("A project's own description.");
            expect(getDescription("ListOwnDescriptionTest")).toBe("A project's own description.");
        });
    });
});
