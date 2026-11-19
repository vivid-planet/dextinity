import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { createRichTextBlock } from "./createRichTextBlock";

const RichTextBlock = createRichTextBlock({ link: ExternalLinkBlock }, "RichTextValidationTest");

describe("createRichTextBlock", () => {
    it("should report invalid draft content with a message", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input = RichTextBlock.blockInputFactory({ draftContent: { blocks: "abc" } } as any);

        const errors = await validate(input, { whitelist: true, forbidNonWhitelisted: true });

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("draftContent");
        expect(errors[0].constraints?.isDraftContent).toBe(
            "draftContent must be a Draft.js content object with blocks and entityMap, where each entity is a LINK with valid ExternalLink data",
        );
    });
});
