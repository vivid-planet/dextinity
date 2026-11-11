import { describe, expect, it } from "vitest";

import { VimeoVideoBlock } from "./VimeoVideoBlock";

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

describe("VimeoVideoBlock", () => {
    describe("dependencies", () => {
        it("should return the preview image", () => {
            expect(
                VimeoVideoBlock.dependencies?.({
                    vimeoIdentifier: null,
                    ...videoSettings,
                    previewImage: { damFile: previewImageDamFile, cropArea: null },
                }),
            ).toEqual([{ targetGraphqlObjectType: "DamFile", id: "image-1", data: { damFile: previewImageDamFile } }]);
        });

        it("should return no dependencies without a preview image", () => {
            expect(
                VimeoVideoBlock.dependencies?.({ vimeoIdentifier: null, ...videoSettings, previewImage: { damFile: null, cropArea: null } }),
            ).toEqual([]);
        });
    });

    describe("replaceDependenciesInOutput", () => {
        it("should replace the preview image file", () => {
            expect(
                VimeoVideoBlock.replaceDependenciesInOutput(
                    { ...videoSettings, vimeoIdentifier: "76979871", previewImage: { damFileId: "image-1", cropArea: null } },
                    [{ type: "DamFile", originalId: "image-1", replaceWithId: "image-2" }],
                ),
            ).toEqual({ ...videoSettings, vimeoIdentifier: "76979871", previewImage: { damFileId: "image-2", cropArea: null } });
        });

        it("should keep the id without a replacement", () => {
            expect(
                VimeoVideoBlock.replaceDependenciesInOutput(
                    { ...videoSettings, vimeoIdentifier: "76979871", previewImage: { damFileId: "image-1", cropArea: null } },
                    [],
                ),
            ).toEqual({
                ...videoSettings,
                vimeoIdentifier: "76979871",
                previewImage: { damFileId: "image-1", cropArea: null },
            });
        });
    });
});
