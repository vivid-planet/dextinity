import { describe, expect, it } from "vitest";

import { createExternalLinkBlock } from "./create-external-link.block.js";

function fieldNames(block: ReturnType<typeof createExternalLinkBlock>) {
    return {
        fields: block.blockMeta.fields.map((field) => field.name),
        inputFields: block.blockInputMeta.fields.map((field) => field.name),
    };
}

describe("createExternalLinkBlock", () => {
    it("should offer both options by default", () => {
        expect(fieldNames(createExternalLinkBlock({}, "DefaultLink"))).toEqual({
            fields: ["targetUrl", "openInNewWindow", "noFollow"],
            inputFields: ["targetUrl", "openInNewWindow", "noFollow"],
        });
    });

    it("should not have a field for an option that is left out", () => {
        expect(fieldNames(createExternalLinkBlock({ openInNewWindow: false, noFollow: false }, "UrlLink"))).toEqual({
            fields: ["targetUrl"],
            inputFields: ["targetUrl"],
        });

        expect(fieldNames(createExternalLinkBlock({ openInNewWindow: false }, "NoFollowLink"))).toEqual({
            fields: ["targetUrl", "noFollow"],
            inputFields: ["targetUrl", "noFollow"],
        });
    });

    describe("content stored by ExternalLinkBlock", () => {
        const stored = { targetUrl: "https://www.example.com", openInNewWindow: true, noFollow: true, $$version: 1 };

        it("should pass on only the fields the block has", async () => {
            const UrlLinkBlock = createExternalLinkBlock({ openInNewWindow: false, noFollow: false }, "StoredUrlLink");

            expect(await UrlLinkBlock.blockDataFactory({ ...stored }).transformToPlain()).toEqual({ targetUrl: "https://www.example.com" });
        });

        it("should add noFollow to content stored before it existed", async () => {
            const NoFollowLinkBlock = createExternalLinkBlock({ openInNewWindow: false }, "LegacyNoFollowLink");

            expect(
                await NoFollowLinkBlock.blockDataFactory({ targetUrl: "https://www.example.com", openInNewWindow: true }).transformToPlain(),
            ).toEqual({
                targetUrl: "https://www.example.com",
                noFollow: false,
            });
        });
    });

    it("should leave options that are left out out of the block data created from the input", () => {
        const UrlLinkBlock = createExternalLinkBlock({ openInNewWindow: false, noFollow: false }, "InputUrlLink");

        expect(
            UrlLinkBlock.blockInputFactory({ targetUrl: "https://www.example.com", openInNewWindow: true } as never)
                .transformToBlockData()
                .transformToSave(),
        ).toEqual({ targetUrl: "https://www.example.com", $$vendorVersion: 1 });
    });
});
