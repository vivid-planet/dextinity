import { describe, expect, it } from "vitest";

import { InternalLinkBlock } from "../../page-tree/blocks/internal-link.block";
import { createImageLinkBlock } from "./createImageLinkBlock";

describe("createImageLinkBlock", () => {
    it("should allow overriding the name", () => {
        expect(createImageLinkBlock({ link: InternalLinkBlock }).name).toEqual("ImageLink");

        expect(createImageLinkBlock({ link: InternalLinkBlock }, "MyCustomImageLink").name).toEqual("MyCustomImageLink");
    });
});
