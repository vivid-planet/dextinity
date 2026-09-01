import { ValidationPipe } from "@nestjs/common";
import { Transform } from "class-transformer";
import { validate, ValidateNested } from "class-validator";
import { describe, expect, it } from "vitest";

import { BlockData, BlockInput, BlockInputInterface, blockInputToData, createBlock } from "./block";
import { createLinkBlock } from "./factories/createLinkBlock";
import { createListBlock } from "./factories/createListBlock";
import { createRichTextBlock } from "./factories/createRichTextBlock";
import { createTipTapRichTextBlock } from "./tipTap/createTipTapRichTextBlock";

// A block without any class-validator decorators, e.g. a block without fields.
// class-validator's `forbidUnknownValues` (enabled by default since v0.14) rejects such classes unless they have validation metadata.
class NoValidationBlockData extends BlockData {}

class NoValidationBlockInput extends BlockInput {
    transformToBlockData(): NoValidationBlockData {
        return blockInputToData(NoValidationBlockData, this);
    }
}

const NoValidationBlock = createBlock(NoValidationBlockData, NoValidationBlockInput, "NoValidation");

const LinkBlock = createLinkBlock({ supportedBlocks: { noValidation: NoValidationBlock } }, "NoValidationLink");
const linkData = { attachedBlocks: [{ type: "noValidation", props: {} }], activeType: "noValidation" };

describe("block input without validation annotations", () => {
    it("should validate", async () => {
        const errors = await validate(NoValidationBlock.blockInputFactory({}), { forbidNonWhitelisted: true, whitelist: true });

        expect(errors).toHaveLength(0);
    });

    // The property that provides the validation metadata is validated and therefore whitelisted. It must not be
    // settable, otherwise clients could store arbitrary data in every block.
    it("should reject the property that provides the validation metadata", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = NoValidationBlock.blockInputFactory({ thisBlockInputNeedsValidationMetadata____: "any value" } as any);

        const errors = await validate(input, { forbidNonWhitelisted: true, whitelist: true });

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("thisBlockInputNeedsValidationMetadata____");
    });

    // Covers the save path of an application: NestJS' ValidationPipe defaults `forbidUnknownValues` to false, so this
    // path works even without validation metadata. It's covered nonetheless as applications may configure it themselves.
    it("should validate when nested in another block passed through a ValidationPipe", async () => {
        const LinkListBlock = createListBlock({ block: LinkBlock }, "NoValidationLinkList");

        class TestInput {
            @Transform(({ value }) => LinkListBlock.blockInputFactory(value), { toClassOnly: true })
            @ValidateNested()
            content: BlockInputInterface;
        }

        const pipe = new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true });
        const value = { content: { blocks: [{ key: "1", visible: true, props: linkData }] } };

        await expect(pipe.transform(value, { type: "body", metatype: TestInput })).resolves.toBeInstanceOf(TestInput);
    });

    it("should validate when used as link block of a DraftJS rich text block", async () => {
        const RichTextBlock = createRichTextBlock({ link: LinkBlock }, "NoValidationRichText");
        const input = RichTextBlock.blockInputFactory({
            draftContent: {
                blocks: [
                    {
                        key: "a",
                        text: "click here",
                        type: "unstyled",
                        depth: 0,
                        inlineStyleRanges: [],
                        entityRanges: [{ offset: 0, length: 10, key: 0 }],
                    },
                ],
                entityMap: { 0: { type: "LINK", mutability: "MUTABLE", data: linkData } },
            },
        });

        const errors = await validate(input, { forbidNonWhitelisted: true, whitelist: true });

        expect(errors).toHaveLength(0);
    });

    it("should validate when used as link block of a TipTap rich text block", async () => {
        const TipTapRichTextBlock = createTipTapRichTextBlock({ link: LinkBlock }, "NoValidationTipTapLink");
        const input = TipTapRichTextBlock.blockInputFactory({
            tipTapContent: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [{ type: "text", marks: [{ type: "link", attrs: { data: linkData } }], text: "click here" }],
                    },
                ],
            },
        });

        const errors = await validate(input, { forbidNonWhitelisted: true, whitelist: true });

        expect(errors).toHaveLength(0);
    });

    it("should validate when used as child block of a TipTap rich text block", async () => {
        const TipTapRichTextBlock = createTipTapRichTextBlock(
            { childBlocks: { noValidation: { block: NoValidationBlock, display: "block" } } },
            "NoValidationTipTapChildBlock",
        );
        const input = TipTapRichTextBlock.blockInputFactory({
            tipTapContent: {
                type: "doc",
                content: [{ type: "cmsBlock", attrs: { blockType: "noValidation", data: {} } }],
            },
        });

        const errors = await validate(input, { forbidNonWhitelisted: true, whitelist: true });

        expect(errors).toHaveLength(0);
    });
});
