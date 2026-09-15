import { describe, expect, it } from "vitest";

import { createDamVideoBlock, type DamVideoBlockState } from "./createDamVideoBlock";

const videoDamFile = {
    id: "video-1",
    name: "video.mp4",
    size: 1000,
    mimetype: "video/mp4",
    contentHash: "video-hash",
    archived: false,
    fileUrl: "https://example.com/video.mp4",
};

const previewImageDamFile = {
    id: "image-1",
    name: "preview.png",
    size: 100,
    mimetype: "image/png",
    contentHash: "image-hash",
    archived: false,
    fileUrl: "https://example.com/preview.png",
};

const createState = (state: Partial<DamVideoBlockState> = {}): DamVideoBlockState => ({
    previewImage: {},
    ...state,
});

describe("createDamVideoBlock", () => {
    it("should create a block named DamVideo", () => {
        expect(createDamVideoBlock().name).toBe("DamVideo");
    });

    it("should allow setting the name", () => {
        expect(createDamVideoBlock({ name: "TeaserVideo" }).name).toBe("TeaserVideo");
    });

    it("should allow overriding the tags", () => {
        expect(createDamVideoBlock({ tags: ["Movie"] }).tags).toEqual(["Movie"]);
    });

    it("should allow overriding the block", () => {
        const block = createDamVideoBlock({}, (block) => ({ ...block, name: "MyCustomDamVideo" }));

        expect(block.name).toBe("MyCustomDamVideo");
    });

    describe("dependencies", () => {
        it("should return the video file and the preview image", () => {
            const block = createDamVideoBlock();

            expect(block.dependencies?.(createState({ damFile: videoDamFile, previewImage: { damFile: previewImageDamFile } }))).toEqual([
                { targetGraphqlObjectType: "DamFile", id: "video-1", data: { damFile: videoDamFile } },
                { targetGraphqlObjectType: "DamFile", id: "image-1", data: { damFile: previewImageDamFile } },
            ]);
        });

        it("should return the preview image even when no video file is set", () => {
            const block = createDamVideoBlock();

            expect(block.dependencies?.(createState({ previewImage: { damFile: previewImageDamFile } }))).toEqual([
                { targetGraphqlObjectType: "DamFile", id: "image-1", data: { damFile: previewImageDamFile } },
            ]);
        });

        it("should return no dependencies for an empty block", () => {
            const block = createDamVideoBlock();

            expect(block.dependencies?.(createState())).toEqual([]);
        });
    });

    describe("replaceDependenciesInOutput", () => {
        it("should replace the video file and the preview image file", () => {
            const block = createDamVideoBlock();

            expect(
                block.replaceDependenciesInOutput({ damFileId: "video-1", previewImage: { damFileId: "image-1" } }, [
                    { type: "DamFile", originalId: "video-1", replaceWithId: "video-2" },
                    { type: "DamFile", originalId: "image-1", replaceWithId: "image-2" },
                ]),
            ).toEqual({ damFileId: "video-2", previewImage: { damFileId: "image-2" } });
        });

        it("should keep ids without a replacement", () => {
            const block = createDamVideoBlock();

            expect(
                block.replaceDependenciesInOutput({ damFileId: "video-1", previewImage: { damFileId: "image-1" } }, [
                    { type: "DamFile", originalId: "image-1", replaceWithId: "image-2" },
                ]),
            ).toEqual({ damFileId: "video-1", previewImage: { damFileId: "image-2" } });
        });
    });
});
