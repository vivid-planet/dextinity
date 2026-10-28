import { validate } from "class-validator";
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

    it("should report invalid draft content with a message", async () => {
        const ValidationRichTextBlock = createRichTextBlock({ link: ExternalLinkBlock }, "RichTextValidationTest");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = ValidationRichTextBlock.blockInputFactory({ draftContent: { blocks: "abc" } } as any);

        const errors = await validate(input, { whitelist: true, forbidNonWhitelisted: true });

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("draftContent");
        expect(errors[0].constraints?.isDraftContent).toBe(
            "draftContent must be a Draft.js content object with blocks and entityMap, where each entity is a LINK with valid ExternalLink data",
        );
    });
});
