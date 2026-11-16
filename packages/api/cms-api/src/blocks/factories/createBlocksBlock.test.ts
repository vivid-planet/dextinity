import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../../page-tree/blocks/internal-link.block.js";
import { ExternalLinkBlock } from "../externalLink/external-link.block.js";
import { createBlocksBlock } from "./createBlocksBlock.js";

const BlocksBlock = createBlocksBlock({ supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock } }, "BlocksBlockValidationTest");

const externalLinkItem = {
    key: "1",
    visible: true,
    type: "external",
    props: { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false },
};

const validationOptions = { whitelist: true, forbidNonWhitelisted: true };

describe("createBlocksBlock", () => {
    it.each(["unknown", "toString"])("should report the unknown type '%s' at the index of the input", async (type) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = BlocksBlock.blockInputFactory({ blocks: [externalLinkItem, { ...externalLinkItem, key: "2", type, props: {} }] } as any);

        const errors = await validate(input, validationOptions);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("blocks");
        expect(errors[0].children).toHaveLength(1);
        expect(errors[0].children?.[0].property).toBe("1");
        expect(errors[0].children?.[0].children).toHaveLength(1);
        expect(errors[0].children?.[0].children?.[0]).toMatchObject({ property: "type", constraints: { isIn: expect.any(String) } });
    });

    it.each(["abc", {}])("should report blocks that aren't an array (%j)", async (blocks) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = BlocksBlock.blockInputFactory({ blocks } as any);

        const errors = await validate(input, validationOptions);

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "blocks", constraints: { isArray: expect.any(String) } });
    });

    it("should report an item that is an array", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = BlocksBlock.blockInputFactory({ blocks: [externalLinkItem, []] } as any);

        const errors = await validate(input, validationOptions);

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "blocks", constraints: { isObject: expect.any(String) } });
    });
});
