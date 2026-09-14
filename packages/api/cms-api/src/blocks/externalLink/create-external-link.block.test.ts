import { describe, expect, it } from "vitest";

import { createExternalLinkBlock } from "./create-external-link.block";

function fieldNames(block: ReturnType<typeof createExternalLinkBlock>) {
    return {
        fields: block.blockMeta.fields.map((field) => field.name),
        inputFields: block.blockInputMeta.fields.map((field) => field.name),
    };
}

describe("createExternalLinkBlock", () => {
    it("should use the given name", () => {
        expect(createExternalLinkBlock({}, "UrlOnlyLink").name).toBe("UrlOnlyLink");
    });

    it("should offer both options by default", () => {
        expect(fieldNames(createExternalLinkBlock({}, "DefaultLink"))).toEqual({
            fields: ["targetUrl", "openInNewWindow", "noFollow"],
            inputFields: ["targetUrl", "openInNewWindow", "noFollow"],
        });
    });

    it("should not have a field for an option that is left out", () => {
        expect(fieldNames(createExternalLinkBlock({ supports: [] }, "UrlLink"))).toEqual({
            fields: ["targetUrl"],
            inputFields: ["targetUrl"],
        });

        expect(fieldNames(createExternalLinkBlock({ supports: ["noFollow"] }, "NoFollowLink"))).toEqual({
            fields: ["targetUrl", "noFollow"],
            inputFields: ["targetUrl", "noFollow"],
        });
    });

    it("should keep the field order stable regardless of how supports is ordered", () => {
        expect(fieldNames(createExternalLinkBlock({ supports: ["noFollow", "openInNewWindow"] }, "ReorderedLink")).fields).toEqual([
            "targetUrl",
            "openInNewWindow",
            "noFollow",
        ]);
    });

    it("should not leak fields between blocks created by separate calls", () => {
        createExternalLinkBlock({ supports: [] }, "FirstLink");

        expect(fieldNames(createExternalLinkBlock({}, "SecondLink")).fields).toEqual(["targetUrl", "openInNewWindow", "noFollow"]);
    });

    it("should transform the input to block data", () => {
        const UrlLinkBlock = createExternalLinkBlock({ supports: [] }, "TransformingLink");

        expect(UrlLinkBlock.blockInputFactory({ targetUrl: "https://www.example.com" }).transformToBlockData().transformToSave()).toMatchObject({
            targetUrl: "https://www.example.com",
        });
    });
});
