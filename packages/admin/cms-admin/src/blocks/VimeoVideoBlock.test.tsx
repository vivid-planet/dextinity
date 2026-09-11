import { describe, expect, it } from "vitest";

import { VimeoVideoBlock } from "./VimeoVideoBlock";

const previewImageDamFile = {
    id: "image-1",
    name: "preview.png",
    size: 100,
    mimetype: "image/png",
    contentHash: "image-hash",
    archived: false,
    fileUrl: "https://example.com/preview.png",
};

describe("VimeoVideoBlock", () => {
    describe("dependencies", () => {
        it("should return the preview image", () => {
            expect(VimeoVideoBlock.dependencies?.({ previewImage: { damFile: previewImageDamFile } })).toEqual([
                { targetGraphqlObjectType: "DamFile", id: "image-1", data: { damFile: previewImageDamFile } },
            ]);
        });

        it("should return no dependencies without a preview image", () => {
            expect(VimeoVideoBlock.dependencies?.({ previewImage: {} })).toEqual([]);
        });
    });

    describe("replaceDependenciesInOutput", () => {
        it("should replace the preview image file", () => {
            expect(
                VimeoVideoBlock.replaceDependenciesInOutput({ vimeoIdentifier: "76979871", previewImage: { damFileId: "image-1" } }, [
                    { type: "DamFile", originalId: "image-1", replaceWithId: "image-2" },
                ]),
            ).toEqual({ vimeoIdentifier: "76979871", previewImage: { damFileId: "image-2" } });
        });

        it("should keep the id without a replacement", () => {
            expect(VimeoVideoBlock.replaceDependenciesInOutput({ vimeoIdentifier: "76979871", previewImage: { damFileId: "image-1" } }, [])).toEqual({
                vimeoIdentifier: "76979871",
                previewImage: { damFileId: "image-1" },
            });
        });
    });
});
