import { describe, expect, it } from "vitest";

import { YouTubeVideoBlock } from "./YouTubeVideoBlock";

const previewImageDamFile = {
    id: "image-1",
    name: "preview.png",
    size: 100,
    mimetype: "image/png",
    contentHash: "image-hash",
    archived: false,
    fileUrl: "https://example.com/preview.png",
};

describe("YouTubeVideoBlock", () => {
    describe("dependencies", () => {
        it("should return the preview image", () => {
            expect(YouTubeVideoBlock.dependencies?.({ previewImage: { damFile: previewImageDamFile } })).toEqual([
                { targetGraphqlObjectType: "DamFile", id: "image-1", data: { damFile: previewImageDamFile } },
            ]);
        });

        it("should return no dependencies without a preview image", () => {
            expect(YouTubeVideoBlock.dependencies?.({ previewImage: {} })).toEqual([]);
        });
    });

    describe("replaceDependenciesInOutput", () => {
        it("should replace the preview image file", () => {
            expect(
                YouTubeVideoBlock.replaceDependenciesInOutput({ youtubeIdentifier: "dQw4w9WgXcQ", previewImage: { damFileId: "image-1" } }, [
                    { type: "DamFile", originalId: "image-1", replaceWithId: "image-2" },
                ]),
            ).toEqual({ youtubeIdentifier: "dQw4w9WgXcQ", previewImage: { damFileId: "image-2" } });
        });

        it("should keep the id without a replacement", () => {
            expect(
                YouTubeVideoBlock.replaceDependenciesInOutput({ youtubeIdentifier: "dQw4w9WgXcQ", previewImage: { damFileId: "image-1" } }, []),
            ).toEqual({ youtubeIdentifier: "dQw4w9WgXcQ", previewImage: { damFileId: "image-1" } });
        });
    });
});
