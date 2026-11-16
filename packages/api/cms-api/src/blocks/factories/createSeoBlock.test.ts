import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { createSeoBlock } from "./createSeoBlock.js";

const SeoBlock = createSeoBlock();

describe("createSeoBlock", () => {
    it("should report a missing openGraphImage", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = SeoBlock.blockInputFactory({ noIndex: false, priority: "0_5", changeFrequency: "always", alternativeLinks: [] } as any);

        const errors = await validate(input, { whitelist: true, forbidNonWhitelisted: true });

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ property: "openGraphImage", constraints: { isDefined: expect.any(String) } });
    });
});
