import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import {
    BlockData,
    type BlockDataInterface,
    BlockInput,
    blockInputToData,
    createBlock,
    type ExtractBlockData,
    type ExtractBlockInput,
} from "../block.js";
import { ExternalLinkBlock } from "../externalLink/external-link.block.js";
import { createRichTextBlock } from "../factories/createRichTextBlock.js";
import { ChildBlock } from "./child-block.js";
import { ChildBlockInput } from "./child-block-input.js";

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
        expect(errors[0]).toMatchObject({ property: "headline", constraints: { isDefined: expect.any(String) } });
    });
});
