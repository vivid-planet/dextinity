import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../../page-tree/blocks/internal-link.block.js";
import { BlockMetaFieldKind } from "../block.js";
import { ExternalLinkBlock } from "../externalLink/external-link.block.js";
import { createOneOfBlock } from "./createOneOfBlock.js";

describe("createOneOfBlock", () => {
    it("should include attachedBlocks in the block input meta", () => {
        const supportedBlocks = { internal: InternalLinkBlock, external: ExternalLinkBlock };
        const OneOfBlock = createOneOfBlock({ supportedBlocks }, "OneOfBlockInputMetaTest");

        expect(OneOfBlock.blockInputMeta.fields).toEqual([
            {
                name: "attachedBlocks",
                kind: BlockMetaFieldKind.NestedObjectList,
                object: {
                    fields: [
                        { name: "type", kind: BlockMetaFieldKind.String, nullable: false },
                        { name: "props", kind: BlockMetaFieldKind.OneOfBlocks, blocks: supportedBlocks, nullable: false },
                    ],
                },
                nullable: false,
            },
            { name: "activeType", kind: BlockMetaFieldKind.String, nullable: true },
        ]);
    });
});
