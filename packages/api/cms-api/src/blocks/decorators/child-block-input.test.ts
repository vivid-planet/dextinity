import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { BlockData, BlockDataInterface, BlockInput, blockInputToData, createBlock, ExtractBlockData, ExtractBlockInput } from "../block";
import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { createRichTextBlock } from "../factories/createRichTextBlock";
import { ChildBlock } from "./child-block";
import { ChildBlockInput } from "./child-block-input";

const RichTextBlock = createRichTextBlock({ link: ExternalLinkBlock });

class HeadlineBlockData extends BlockData {
    @ChildBlock(RichTextBlock)
    headline: ExtractBlockData<typeof RichTextBlock>;
}

class HeadlineBlockInput extends BlockInput {
    @ChildBlockInput(RichTextBlock)
    headline: ExtractBlockInput<typeof RichTextBlock>;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(HeadlineBlockData, this);
    }
}

const HeadlineBlock = createBlock(HeadlineBlockData, HeadlineBlockInput, "Headline");

describe("ChildBlockInput", () => {
    it("should report a validation error if no value is provided", async () => {
        // `@Transform()` allows any value, so we use any here.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plain: any = {};

        const errors = await validate(HeadlineBlock.blockInputFactory(plain), { whitelist: true, forbidNonWhitelisted: true });

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({
            property: "headline",
            constraints: { isDefined: "headline is missing. Expected a RichText block with the fields draftContent (a JSON value)." },
        });
    });
});
