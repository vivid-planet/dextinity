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

    describe("when the API block doesn't support a preview image", () => {
        // Its stored data has no previewImage at all, so every state and output of the Admin block has to cope
        // with a missing one.
        const block = createDamVideoBlock({ name: "TeaserVideo", supports: [] });
        const storedInput = { damFileId: "video-1" } as unknown as Parameters<typeof block.input2State>[0];

        it("should turn a missing preview image into an empty one", () => {
            expect(block.input2State(storedInput).previewImage).toEqual({});
        });

        it("should create a preview state", () => {
            const state = block.input2State(storedInput);

            expect(() =>
                block.createPreviewState(state, { apiUrl: "https://example.com", damBasePath: "dam" } as unknown as Parameters<
                    typeof block.createPreviewState
                >[1]),
            ).not.toThrow();
        });

        it("should create output with an empty preview image", () => {
            expect(block.state2Output(block.input2State(storedInput))).toMatchObject({ previewImage: {} });
        });

        it("should return only the video file as dependency", () => {
            expect(block.dependencies?.(block.input2State(storedInput))).toEqual([]);
        });

        it("should create state from output without querying the preview image", async () => {
            const apolloClient = { query: async () => ({ data: { damFile: videoDamFile } }) };
            const context = { apolloClient } as unknown as Parameters<typeof block.output2State>[1];

            await expect(block.output2State(storedInput, context)).resolves.toMatchObject({ previewImage: {} });
        });

        it("should replace the video file without a preview image", () => {
            expect(
                block.replaceDependenciesInOutput(storedInput, [{ type: "DamFile", originalId: "video-1", replaceWithId: "video-2" }]),
            ).toMatchObject({ damFileId: "video-2" });
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
