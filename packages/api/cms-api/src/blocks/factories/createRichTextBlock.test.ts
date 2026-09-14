import { describe, expect, it } from "vitest";

import { BlockMetaFieldKind } from "../block";
import { getBlocksMeta } from "../blocks-meta";
import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { createLinkBlock } from "./createLinkBlock";
import { createRichTextBlock } from "./createRichTextBlock";

describe("createRichTextBlock", () => {
    const LinkBlock = createLinkBlock({ supportedBlocks: { external: ExternalLinkBlock } }, "RichTextMetaTestLink");
    const RichTextBlock = createRichTextBlock({ link: LinkBlock }, "RichTextMetaTest");

    it("should include the link block in the block meta", () => {
        const expectedFields = [{ name: "draftContent", kind: BlockMetaFieldKind.RichTextBlock, linkBlock: LinkBlock, nullable: false }];

        expect(RichTextBlock.blockMeta.fields).toEqual(expectedFields);
        expect(RichTextBlock.blockInputMeta.fields).toEqual(expectedFields);
    });

    it("should include the link block name in the generated block meta", () => {
        const blockMeta = getBlocksMeta().find((block) => block.name === "RichTextMetaTest");

        expect(blockMeta?.fields).toEqual([{ name: "draftContent", kind: "RichTextBlock", linkBlock: "RichTextMetaTestLink", nullable: false }]);
    });
});
