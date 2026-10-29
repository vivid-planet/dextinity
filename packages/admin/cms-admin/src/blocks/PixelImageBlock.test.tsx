import type { ApolloClient } from "@apollo/client";
import { describe, expect, it } from "vitest";

import type { PixelImageBlockInput } from "../blocks.generated";
import { PixelImageBlock } from "./PixelImageBlock";

const damFile = {
    id: "image-1",
    name: "photo.png",
    size: 100,
    mimetype: "image/png",
    contentHash: "image-hash",
    archived: false,
    fileUrl: "https://example.com/photo.png",
    image: { width: 400, height: 200, cropArea: { focalPoint: "SMART" } },
};

const apolloClient = { query: async () => ({ data: { damFile } }) } as unknown as ApolloClient<object>;

describe("PixelImageBlock", () => {
    describe("output2State", () => {
        it("should inherit the crop area of the file when the crop area is null", async () => {
            const output = { damFileId: "image-1", cropArea: null } as unknown as PixelImageBlockInput;

            const state = await PixelImageBlock.output2State(output, { apolloClient } as Parameters<typeof PixelImageBlock.output2State>[1]);

            expect(state.cropArea).toBeUndefined();
        });
    });
});
