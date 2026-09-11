import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../../page-tree/blocks/internal-link.block";
import { BlockMetaFieldKind } from "../block";
import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { createOneOfBlock } from "./createOneOfBlock";

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
