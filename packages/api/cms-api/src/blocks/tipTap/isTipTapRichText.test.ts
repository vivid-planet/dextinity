import type { JSONContent } from "@tiptap/core";
import { plainToInstance } from "class-transformer";
import { IsUrl, validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { IsTipTapRichText } from "./isTipTapRichText.js";

class UrlLinkData {
    @IsUrl()
    url: string;
}

class DescriptionInput {
    @IsTipTapRichText({ textBlocks: [{ name: "paragraph", tag: "p" }], link: UrlLinkData, maxTextBlocks: 2 })
    description: JSONContent;
}

const paragraph = (text: string, marks?: JSONContent["marks"]): JSONContent => ({
    type: "textBlock",
    attrs: { textBlock: "paragraph" },
    content: [{ type: "text", text, ...(marks ? { marks } : {}) }],
});

async function validateDescription(description: unknown) {
    return validate(plainToInstance(DescriptionInput, { description }));
}

describe("IsTipTapRichText", () => {
    it("should accept content matching the options", async () => {
        const errors = await validateDescription({ type: "doc", content: [paragraph("Hello", [{ type: "bold" }])] });
        expect(errors).toHaveLength(0);
    });

    it("should reject a text block that isn't configured", async () => {
        const errors = await validateDescription({
            type: "doc",
            content: [{ type: "textBlock", attrs: { textBlock: "heading-1" }, content: [{ type: "text", text: "Hello" }] }],
        });
        expect(errors[0]?.constraints).toEqual({ isTipTapRichText: "description must be valid TipTap JSON content" });
    });

    it("should reject more text blocks than maxTextBlocks", async () => {
        const errors = await validateDescription({ type: "doc", content: [paragraph("1"), paragraph("2"), paragraph("3")] });
        expect(errors).toHaveLength(1);
    });

    it("should accept a link whose data the link class validates", async () => {
        const errors = await validateDescription({
            type: "doc",
            content: [paragraph("Link", [{ type: "link", attrs: { data: { url: "https://example.com" } } }])],
        });
        expect(errors).toHaveLength(0);
    });

    it("should reject a link whose data the link class rejects", async () => {
        const errors = await validateDescription({
            type: "doc",
            content: [paragraph("Link", [{ type: "link", attrs: { data: { url: "not a url" } } }])],
        });
        expect(errors).toHaveLength(1);
    });

    it("should reject a link with data the link class doesn't know", async () => {
        const errors = await validateDescription({
            type: "doc",
            content: [paragraph("Link", [{ type: "link", attrs: { data: { url: "https://example.com", target: "_blank" } } }])],
        });
        expect(errors).toHaveLength(1);
    });

    it("should reject a link when links aren't enabled", async () => {
        class WithoutLinkInput {
            @IsTipTapRichText()
            description: JSONContent;
        }

        const errors = await validate(
            plainToInstance(WithoutLinkInput, {
                description: { type: "doc", content: [paragraph("Link", [{ type: "link", attrs: { data: { url: "https://example.com" } } }])] },
            }),
        );
        expect(errors).toHaveLength(1);
    });
});
