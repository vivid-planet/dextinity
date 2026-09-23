import { describe, expect, it } from "vitest";

import { createExternalLinkBlock } from "./createExternalLinkBlock";

describe("createExternalLinkBlock", () => {
    it("should create a block named ExternalLink", () => {
        expect(createExternalLinkBlock().name).toBe("ExternalLink");
    });

    it("should allow naming the block after the API block it is paired with", () => {
        expect(createExternalLinkBlock({ fields: [], name: "UrlLink" }).name).toBe("UrlLink");
    });

    it("should keep a field the editor can't set in the block's data", () => {
        const block = createExternalLinkBlock({ supports: [] });

        expect(block.defaultValues()).toEqual({ targetUrl: undefined, openInNewWindow: false, noFollow: false });
        expect(block.state2Output(block.defaultValues())).toEqual({ targetUrl: undefined, openInNewWindow: false, noFollow: false });
    });

    it("should require an own name as soon as a field is left out, so that the name keeps promising a field set", () => {
        expect(() => createExternalLinkBlock({ fields: [] })).toThrow(/name/);
        expect(() => createExternalLinkBlock({ fields: ["noFollow"] })).toThrow(/name/);
    });

    it("should leave a field out of the block's data when it isn't one of its fields", () => {
        const block = createExternalLinkBlock({ fields: [], name: "UrlLink" });

        expect(block.defaultValues()).toEqual({ targetUrl: undefined });
        expect(block.state2Output(block.defaultValues())).toEqual({ targetUrl: undefined });
        expect(block.url2State?.("https://www.example.com")).toEqual({ targetUrl: "https://www.example.com" });
    });

    it("should leave out only the fields it was told to", () => {
        expect(createExternalLinkBlock({ fields: ["noFollow"], name: "NoFollowLink" }).defaultValues()).toEqual({
            targetUrl: undefined,
            noFollow: false,
        });
    });

    it("should reject letting the editor set an option the block doesn't have", () => {
        expect(() => createExternalLinkBlock({ fields: [], supports: ["noFollow"], name: "UrlLink" })).toThrow(/noFollow/);
    });

    it("should allow overriding the block", () => {
        const block = createExternalLinkBlock({}, (block) => ({ ...block, name: "MyCustomExternalLink" }));

        expect(block.name).toBe("MyCustomExternalLink");
    });
});
