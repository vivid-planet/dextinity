import { describe, expect, it } from "vitest";

import { BlockMetaFieldKind } from "../block.js";
import { getBlocksMeta } from "../blocks-meta.js";
import { ExternalLinkBlock } from "../externalLink/external-link.block.js";
import { createLinkBlock } from "./createLinkBlock.js";
import { createRichTextBlock } from "./createRichTextBlock.js";

describe("createRichTextBlock", () => {
    const LinkBlock = createLinkBlock({ supportedBlocks: { external: ExternalLinkBlock } }, "RichTextMetaTestLink");
    const RichTextBlock = createRichTextBlock({ link: LinkBlock }, "RichTextMetaTest");

    it("should include the link block in the block meta", () => {
        const expectedFields = [{ name: "draftContent", kind: BlockMetaFieldKind.RichTextBlock, linkBlock: LinkBlock, nullable: false }];

        expect(RichTextBlock.blockMeta.fields).toEqual(expectedFields);
        expect(RichTextBlock.blockInputMeta.fields).toEqual(expectedFields);
    });

    it("should include the link block name in the generated block meta", () => {
        const blockMeta = getBlocksMeta([RichTextBlock]).find((block) => block.name === "RichTextMetaTest");

        expect(blockMeta?.fields).toEqual([{ name: "draftContent", kind: "RichTextBlock", linkBlock: "RichTextMetaTestLink", nullable: false }]);
    });
});
