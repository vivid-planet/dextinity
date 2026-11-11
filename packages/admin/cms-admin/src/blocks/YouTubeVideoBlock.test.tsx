import { describe, expect, it } from "vitest";

import { YouTubeVideoBlock } from "./YouTubeVideoBlock";

const previewImageDamFile = {
    id: "image-1",
    name: "preview.png",
    size: 100,
    mimetype: "image/png",
    contentHash: "image-hash",
    title: null,
    altText: null,
    aiContentType: null,
    archived: false,
    scope: null,
    image: null,
    fileUrl: "https://example.com/preview.png",
};

const videoSettings = { autoplay: null, loop: null, showControls: null };

describe("YouTubeVideoBlock", () => {
    describe("dependencies", () => {
        it("should return the preview image", () => {
            expect(
                YouTubeVideoBlock.dependencies?.({
                    youtubeIdentifier: null,
                    ...videoSettings,
                    previewImage: { damFile: previewImageDamFile, cropArea: null },
                }),
            ).toEqual([{ targetGraphqlObjectType: "DamFile", id: "image-1", data: { damFile: previewImageDamFile } }]);
        });

        it("should return no dependencies without a preview image", () => {
            expect(
                YouTubeVideoBlock.dependencies?.({ youtubeIdentifier: null, ...videoSettings, previewImage: { damFile: null, cropArea: null } }),
            ).toEqual([]);
        });
    });

    describe("replaceDependenciesInOutput", () => {
        it("should replace the preview image file", () => {
            expect(
                YouTubeVideoBlock.replaceDependenciesInOutput(
                    { ...videoSettings, youtubeIdentifier: "dQw4w9WgXcQ", previewImage: { damFileId: "image-1", cropArea: null } },
                    [{ type: "DamFile", originalId: "image-1", replaceWithId: "image-2" }],
                ),
            ).toEqual({ ...videoSettings, youtubeIdentifier: "dQw4w9WgXcQ", previewImage: { damFileId: "image-2", cropArea: null } });
        });

        it("should keep the id without a replacement", () => {
            expect(
                YouTubeVideoBlock.replaceDependenciesInOutput(
                    { ...videoSettings, youtubeIdentifier: "dQw4w9WgXcQ", previewImage: { damFileId: "image-1", cropArea: null } },
                    [],
                ),
            ).toEqual({ ...videoSettings, youtubeIdentifier: "dQw4w9WgXcQ", previewImage: { damFileId: "image-1", cropArea: null } });
        });
    });
});
