import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { ExternalLinkBlock } from "../externalLink/external-link.block.js";
import { createListBlock } from "./createListBlock.js";

const ListBlock = createListBlock({ block: ExternalLinkBlock }, "ListBlockValidationTest");

describe("createListBlock", () => {
    it.each(["abc", {}])("should report blocks that aren't an array (%j)", async (blocks) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = ListBlock.blockInputFactory({ blocks } as any);

        const errors = await validate(input, { whitelist: true, forbidNonWhitelisted: true });

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "blocks", constraints: { isArray: expect.any(String) } });
    });

    it("should report an item that is an array", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = ListBlock.blockInputFactory({ blocks: [[]] } as any);

        const errors = await validate(input, { whitelist: true, forbidNonWhitelisted: true });

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "blocks", constraints: { isObject: expect.any(String) } });
    });
});
