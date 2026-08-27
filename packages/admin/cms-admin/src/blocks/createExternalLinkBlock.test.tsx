import { describe, expect, it } from "vitest";

import { createExternalLinkBlock } from "./createExternalLinkBlock";

describe("createExternalLinkBlock", () => {
    it("should create a block named ExternalLink", () => {
        expect(createExternalLinkBlock().name).toBe("ExternalLink");
    });

    it("should keep the hidden fields in the block's data", () => {
        expect(createExternalLinkBlock({ supports: [] }).defaultValues()).toEqual({
            targetUrl: undefined,
            openInNewWindow: false,
            noFollow: false,
        });
    });

    it("should allow overriding the block", () => {
        const block = createExternalLinkBlock({}, (block) => ({ ...block, name: "MyCustomExternalLink" }));

        expect(block.name).toBe("MyCustomExternalLink");
    });
});
