import { IsString } from "class-validator";
import { describe, expect, it } from "vitest";

import { BlockData, BlockInput, blockInputToData, createBlock } from "./block";
import { ChildBlock } from "./decorators/child-block";
import { ChildBlockInput } from "./decorators/child-block-input";
import { BlockField } from "./decorators/field";
import { createBlocksBlock } from "./factories/createBlocksBlock";
import { createLinkBlock } from "./factories/createLinkBlock";
import { createTipTapRichTextBlock } from "./tipTap/createTipTapRichTextBlock";
import { getUsedBlocks } from "./used-blocks";

function createTestBlock(name: string) {
    class TestBlockData extends BlockData {
        @BlockField()
        title: string;
    }

    class TestBlockInput extends BlockInput {
        @IsString()
        @BlockField()
        title: string;

        transformToBlockData(): TestBlockData {
            return blockInputToData(TestBlockData, this);
        }
    }

    return createBlock(TestBlockData, TestBlockInput, name);
}

const HeadlineBlock = createTestBlock("UsedBlocksTestHeadline");
const ImageBlock = createTestBlock("UsedBlocksTestImage");
const UnusedBlock = createTestBlock("UsedBlocksTestUnused");

class TeaserBlockData extends BlockData {
    @ChildBlock(ImageBlock)
    image: BlockData;
}

class TeaserBlockInput extends BlockInput {
    @ChildBlockInput(ImageBlock)
    image: BlockInput;

    transformToBlockData(): TeaserBlockData {
        return blockInputToData(TeaserBlockData, this);
    }
}

const TeaserBlock = createBlock(TeaserBlockData, TeaserBlockInput, "UsedBlocksTestTeaser");

const ContentBlock = createBlocksBlock({ supportedBlocks: { headline: HeadlineBlock, teaser: TeaserBlock } }, "UsedBlocksTestContent");

const LinkBlock = createLinkBlock({ supportedBlocks: { headline: HeadlineBlock } }, "UsedBlocksTestLink");
const TipTapRichTextBlock = createTipTapRichTextBlock(
    { link: LinkBlock, childBlocks: { image: { block: ImageBlock, display: "block" } } },
    "UsedBlocksTestTipTapRichText",
);

describe("getUsedBlocks", () => {
    it("returns the root block and all blocks it references", () => {
        const usedBlocks = getUsedBlocks([ContentBlock]);

        expect(usedBlocks).toContain(ContentBlock);
        expect(usedBlocks).toContain(HeadlineBlock);
        expect(usedBlocks).toContain(TeaserBlock);
        expect(usedBlocks).toContain(ImageBlock);
    });

    it("doesn't return registered blocks that aren't used", () => {
        const usedBlocks = getUsedBlocks([ContentBlock]);

        expect(usedBlocks).not.toContain(UnusedBlock);
    });

    it("returns the link and child blocks of a TipTap rich text block", () => {
        const usedBlocks = getUsedBlocks([TipTapRichTextBlock]);

        expect(usedBlocks).toContain(LinkBlock);
        expect(usedBlocks).toContain(ImageBlock);
    });

    it("returns every block only once", () => {
        const usedBlocks = getUsedBlocks([ContentBlock, ContentBlock, HeadlineBlock]);

        expect(usedBlocks.length).toBe(new Set(usedBlocks).size);
    });
});
