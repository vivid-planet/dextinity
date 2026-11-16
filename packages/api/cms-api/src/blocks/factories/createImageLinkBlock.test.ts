import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../../page-tree/blocks/internal-link.block.js";
import { createImageLinkBlock } from "./createImageLinkBlock.js";

describe("createImageLinkBlock", () => {
    it("should allow overriding the name", () => {
        expect(createImageLinkBlock({ link: InternalLinkBlock }).name).toEqual("ImageLink");

        expect(createImageLinkBlock({ link: InternalLinkBlock }, "MyCustomImageLink").name).toEqual("MyCustomImageLink");
    });
});
