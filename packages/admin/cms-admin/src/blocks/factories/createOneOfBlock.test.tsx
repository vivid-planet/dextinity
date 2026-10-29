import { describe, expect, it } from "vitest";

import type { BlockContext } from "../context/BlockContext";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory } from "../types";
import { createOneOfBlock } from "./createOneOfBlock";

describe("createOneOfBlock", () => {
    const TestBlock = {
        ...createBlockSkeleton(),
        category: BlockCategory.TextAndContent,
        name: "title",
        displayName: "Title",
        defaultValues: () => ({}),
    };

    it("should override block's values", () => {
        const nameOverride = "override name";
        const block = createOneOfBlock(
            {
                name: "testBlocksBlock",
                displayName: "Test List Block",
                supportedBlocks: { TestContentBlock: TestBlock },
            },
            (block) => {
                block.name = nameOverride;
                return block;
            },
        );
        expect(block.name).toBe(nameOverride);
    });

    it("should name the attached types when activeType has no entry in attachedBlocks", () => {
        const block = createOneOfBlock({
            name: "testOneOfBlock",
            displayName: "Test One Of Block",
            supportedBlocks: { internal: TestBlock, external: TestBlock },
        });

        expect(() => block.previewContent({ attachedBlocks: [{ type: "internal", props: {} }], activeType: "external" }, {} as BlockContext)).toThrow(
            'activeType "external" has no entry in attachedBlocks, which holds: "internal".',
        );
        expect(() => block.previewContent({ attachedBlocks: [], activeType: "external" }, {} as BlockContext)).toThrow(
            'activeType "external" has no entry in attachedBlocks, which is empty.',
        );
    });
});
