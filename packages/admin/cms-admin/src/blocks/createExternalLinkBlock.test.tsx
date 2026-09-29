import { describe, expect, expectTypeOf, it } from "vitest";

import { createExternalLinkBlock } from "./createExternalLinkBlock";

describe("createExternalLinkBlock", () => {
    it("should create a block named ExternalLink", () => {
        expect(createExternalLinkBlock().name).toBe("ExternalLink");
    });

    it("should allow naming the block after the API block it is paired with", () => {
        expect(createExternalLinkBlock({ name: "UrlLink", openInNewWindow: false, noFollow: false }).name).toBe("UrlLink");
    });

    it("should keep a disabled option in the block's data without a name of its own", () => {
        const block = createExternalLinkBlock({ openInNewWindow: false, noFollow: false });

        expect(block.defaultValues()).toEqual({ targetUrl: undefined, openInNewWindow: false, noFollow: false });
        expect(block.state2Output(block.defaultValues())).toEqual({ targetUrl: undefined, openInNewWindow: false, noFollow: false });
    });

    it("should keep a disabled option in the block's data when named ExternalLink explicitly", () => {
        const block = createExternalLinkBlock({ name: "ExternalLink", openInNewWindow: false, noFollow: false });

        expect(block.defaultValues()).toEqual({ targetUrl: undefined, openInNewWindow: false, noFollow: false });
    });

    it("should leave a disabled option out of the block's data with a name of its own", () => {
        const block = createExternalLinkBlock({ name: "UrlLink", openInNewWindow: false, noFollow: false });

        expect(block.defaultValues()).toEqual({ targetUrl: undefined });
        expect(block.state2Output(block.defaultValues())).toEqual({ targetUrl: undefined });
        expect(block.url2State?.("https://www.example.com")).toEqual({ targetUrl: "https://www.example.com" });
    });

    it("should leave out only the options it was told to", () => {
        expect(createExternalLinkBlock({ name: "NoFollowLink", openInNewWindow: false }).defaultValues()).toEqual({
            targetUrl: undefined,
            noFollow: false,
        });
    });

    it("should allow overriding the block", () => {
        const block = createExternalLinkBlock({}, (block) => ({ ...block, name: "MyCustomExternalLink" }));

        expect(block.name).toBe("MyCustomExternalLink");
    });

    it("should type the options as always present unless the block has a name of its own", () => {
        expectTypeOf(createExternalLinkBlock().defaultValues().openInNewWindow).toEqualTypeOf<boolean>();
        expectTypeOf(createExternalLinkBlock({ openInNewWindow: false, noFollow: false }).defaultValues().noFollow).toEqualTypeOf<boolean>();
        expectTypeOf(createExternalLinkBlock({ name: "TypedUrlLink", noFollow: false }).defaultValues().noFollow).toEqualTypeOf<
            boolean | undefined
        >();
    });
});
