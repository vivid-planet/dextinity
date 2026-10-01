import { describe, expect, it } from "vitest";

import { BlockData, type BlockDataInterface, BlockInput, blockInputToData, createBlock } from "./block";
import { ExternalLinkBlock } from "./externalLink/external-link.block";
import { createOneOfBlock } from "./factories/createOneOfBlock";
import { createRichTextBlock } from "./factories/createRichTextBlock";
import { createTipTapRichTextBlock } from "./tipTap/createTipTapRichTextBlock";

class TestBlockData extends BlockData {}

class TestBlockInput extends BlockInput {
    transformToBlockData(): BlockDataInterface {
        return blockInputToData(TestBlockData, this);
    }
}

describe("createBlock", () => {
    it("should keep the description of the block", () => {
        const block = createBlock(TestBlockData, TestBlockInput, {
            name: "DescriptionTest",
            description: "A block that exists to be described.",
        });

        expect(block.description).toBe("A block that exists to be described.");
    });

    it("should leave the description undefined when the block is created with a name only", () => {
        const block = createBlock(TestBlockData, TestBlockInput, "WithoutDescriptionTest");

        expect(block.description).toBeUndefined();
    });
});

describe("block factories", () => {
    it("should keep the description of the block", () => {
        const oneOfBlock = createOneOfBlock(
            { supportedBlocks: { external: ExternalLinkBlock } },
            { name: "OneOfBlockDescriptionTest", description: "A one of block." },
        );
        const richTextBlock = createRichTextBlock(
            { link: ExternalLinkBlock },
            { name: "RichTextDescriptionTest", description: "A rich text block." },
        );
        const tipTapRichTextBlock = createTipTapRichTextBlock({}, { name: "TipTapRichTextDescriptionTest", description: "A TipTap block." });

        expect(oneOfBlock.description).toBe("A one of block.");
        expect(richTextBlock.description).toBe("A rich text block.");
        expect(tipTapRichTextBlock.description).toBe("A TipTap block.");
    });
});
