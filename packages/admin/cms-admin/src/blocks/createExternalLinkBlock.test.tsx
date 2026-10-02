import { describe, expect, expectTypeOf, it } from "vitest";

import { createExternalLinkBlock } from "./createExternalLinkBlock";

describe("createExternalLinkBlock", () => {
    it("should create a block named ExternalLink", () => {
        expect(createExternalLinkBlock().name).toBe("ExternalLink");
    });

    it("should allow naming the block after the API block it is paired with", () => {
        expect(createExternalLinkBlock({ name: "UrlLink", openInNewWindow: false, noFollow: false }).name).toBe("UrlLink");
    });

    it("should have all options by default", () => {
        const block = createExternalLinkBlock();

        expect(block.defaultValues()).toEqual({ targetUrl: undefined, openInNewWindow: false, noFollow: false });
        expect(block.state2Output(block.defaultValues())).toEqual({ targetUrl: undefined, openInNewWindow: false, noFollow: false });
    });

    it("should leave a disabled option out of the block's data", () => {
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

    it("should type an option as present unless it is disabled", () => {
        expectTypeOf(createExternalLinkBlock().defaultValues().openInNewWindow).toEqualTypeOf<boolean>();
        const defaultValues = createExternalLinkBlock({ name: "TypedNoFollowLink", openInNewWindow: false }).defaultValues();

        expectTypeOf(defaultValues).not.toHaveProperty("openInNewWindow");
        expectTypeOf(defaultValues.noFollow).toEqualTypeOf<boolean>();
    });

    it("should type an option as optional when it isn't known whether it is disabled", () => {
        const isNoFollowEnabled: boolean = Math.random() > 0.5;

        expectTypeOf(createExternalLinkBlock({ name: "TypedUndecidedLink", noFollow: isNoFollowEnabled }).defaultValues().noFollow).toEqualTypeOf<
            boolean | undefined
        >();
    });
});
