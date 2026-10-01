import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../../page-tree/blocks/internal-link.block";
import { BlockData, BlockInput, blockInputToData, createBlock } from "../block";
import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { createLinkBlock } from "./createLinkBlock";

// A link type without fields (and thus without validation decorators), e.g. an "app link" that only
// needs its type selected. It must not be rejected by class-validator's forbidUnknownValues.
class NoFieldsLinkBlockData extends BlockData {}
class NoFieldsLinkBlockInput extends BlockInput {
    transformToBlockData(): NoFieldsLinkBlockData {
        return blockInputToData(NoFieldsLinkBlockData, this);
    }
}
const NoFieldsLinkBlock = createBlock(NoFieldsLinkBlockData, NoFieldsLinkBlockInput, "NoFieldsLink");

describe("createLinkBlock", () => {
    it("should have a title", () => {
        const LinkBlock = createLinkBlock({
            supportedBlocks: {
                internal: InternalLinkBlock,
                external: ExternalLinkBlock,
            },
        });

        expect(
            LinkBlock.blockInputFactory({
                attachedBlocks: [],
                activeType: "internal",
                title: "Test",
            })
                .transformToBlockData()
                .transformToSave().title,
        ).toBe("Test");
    });

    it("should accept a selected link type without fields", async () => {
        const LinkBlock = createLinkBlock({ supportedBlocks: { noFields: NoFieldsLinkBlock } }, "LinkWithNoFieldsType");

        const errors = await validate(LinkBlock.blockInputFactory({ attachedBlocks: [{ type: "noFields", props: {} }], activeType: "noFields" }), {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        expect(errors).toHaveLength(0);
    });

    it("should still reject unexpected properties on a link type without fields", async () => {
        const LinkBlock = createLinkBlock({ supportedBlocks: { noFields: NoFieldsLinkBlock } }, "LinkWithNoFieldsTypeStrict");

        const errors = await validate(
            LinkBlock.blockInputFactory({ attachedBlocks: [{ type: "noFields", props: { bogus: "x" } }], activeType: "noFields" }),
            { whitelist: true, forbidNonWhitelisted: true },
        );

        expect(errors.length).toBeGreaterThan(0);
    });
});
