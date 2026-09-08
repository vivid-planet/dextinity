import { describe, expect, it } from "vitest";

import { transformToBlockSave } from "../../../blocks/block";
import { BlockMigration } from "../../../blocks/migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../../blocks/migrations/types";
import { typeSafeBlockMigrationPipe } from "../../../blocks/migrations/typeSafeBlockMigrationPipe";
import { createDamVideoBlock, DamVideoBlock } from "./createDamVideoBlock";

class AddLoopMigration
    extends BlockMigration<(from: { damFileId?: string }) => { damFileId?: string; loop: boolean }>
    implements BlockMigrationInterface
{
    public readonly toVersion = 1;

    protected migrate(props: { damFileId?: string }) {
        return { ...props, loop: true };
    }
}

const damFileId = "0a3a4f9c-1b19-4f7e-bd0a-8e0b6b1a2c3d";

describe("createDamVideoBlock", () => {
    it("should support controls and preview image by default", () => {
        expect(DamVideoBlock.name).toBe("DamVideo");
        expect(DamVideoBlock.blockMeta.fields.map((field) => field.name)).toEqual(["autoplay", "showControls", "loop", "previewImage", "damFile"]);
        expect(DamVideoBlock.blockInputMeta.fields.map((field) => field.name)).toEqual([
            "autoplay",
            "showControls",
            "loop",
            "previewImage",
            "damFileId",
        ]);
    });

    it("should leave out the preview image when it isn't supported", () => {
        const block = createDamVideoBlock({ supports: ["controls"] }, "VideoWithoutPreviewImage");

        expect(block.blockMeta.fields.map((field) => field.name)).toEqual(["autoplay", "showControls", "loop", "damFile"]);
        expect(block.blockInputMeta.fields.map((field) => field.name)).toEqual(["autoplay", "showControls", "loop", "damFileId"]);
    });

    it("should leave out everything but the file when nothing is supported", () => {
        const block = createDamVideoBlock({ supports: [] }, "FileOnlyVideo");

        expect(block.blockMeta.fields.map((field) => field.name)).toEqual(["damFile"]);
        expect(block.blockInputMeta.fields.map((field) => field.name)).toEqual(["damFileId"]);
    });

    it("should store only the supported options", () => {
        const block = createDamVideoBlock({ supports: [] }, "StoringFileOnlyVideo");
        const input = block.blockInputFactory({ damFileId, autoplay: true, showControls: true, loop: true, previewImage: {} });

        expect(transformToBlockSave(input.transformToBlockData())).toEqual({ damFileId });
    });

    it("should create input for a block without a preview image", () => {
        const block = createDamVideoBlock({ supports: ["controls"] }, "InputWithoutPreviewImage");
        const input = block.blockInputFactory({ damFileId, autoplay: true });

        expect(transformToBlockSave(input.transformToBlockData())).toEqual({ damFileId, autoplay: true });
    });

    it("should create input for a block that supports nothing but the file", () => {
        const block = createDamVideoBlock({ supports: [] }, "InputWithFileOnly");
        const input = block.blockInputFactory({ damFileId });

        expect(transformToBlockSave(input.transformToBlockData())).toEqual({ damFileId });
    });

    it("should store the supported options", () => {
        const block = createDamVideoBlock({}, "StoringFullVideo");
        const input = block.blockInputFactory({ damFileId, autoplay: true, previewImage: {} });

        expect(transformToBlockSave(input.transformToBlockData())).toEqual({ damFileId, autoplay: true, previewImage: {} });
    });

    it("should require a preview image in the input when it is supported", () => {
        const block = createDamVideoBlock({}, "InputRequiringPreviewImage");

        expect(() => block.blockInputFactory({ damFileId })).toThrow(/Missing child block input for 'previewImage'/);
    });

    it("should reject a name that is already registered", () => {
        expect(() => createDamVideoBlock({ supports: [] })).toThrow(/already registered/);
    });
});

describe("createDamVideoBlock preview image default", () => {
    it("should default a missing preview image to an empty one", () => {
        const block = createDamVideoBlock({}, "DefaultingPreviewImage");
        const data = block.blockDataFactory({ damFileId, autoplay: true });

        expect(data.previewImage?.constructor.name).toBe("PixelImageBlockData");
        expect(data.childBlocksInfo().map((child) => child.name)).toEqual(["PixelImage"]);
        expect(transformToBlockSave(data)).toEqual({ damFileId, autoplay: true, previewImage: {} });
    });

    it("should default a preview image of content that is past the block's migrations", () => {
        // Content stored while the preview image wasn't supported: no migration reaches it, because its
        // version is already the block's latest.
        const block = createDamVideoBlock({}, { name: "DefaultingPastMigrations", migrate: { version: 1, migrations: [AddLoopMigration] } });
        const data = block.blockDataFactory({ damFileId, autoplay: true, $$version: 1 });

        expect(data.previewImage?.constructor.name).toBe("PixelImageBlockData");
        expect(transformToBlockSave(data)).toEqual({ damFileId, autoplay: true, previewImage: {}, $$version: 1 });
    });

    it("should keep a stored preview image", () => {
        const block = createDamVideoBlock({}, "KeepingPreviewImage");

        expect(transformToBlockSave(block.blockDataFactory({ damFileId, previewImage: { damFileId } }))).toEqual({
            damFileId,
            previewImage: { damFileId },
        });
    });

    it("should not add a preview image to a block that doesn't support one", () => {
        const block = createDamVideoBlock({ supports: ["controls"] }, "NoDefaultWithoutSupport");

        expect(transformToBlockSave(block.blockDataFactory({ damFileId, autoplay: true }))).toEqual({ damFileId, autoplay: true });
    });

    it("should default the preview image only once", () => {
        const block = createDamVideoBlock({}, "DefaultingOnlyOnce");
        const once = transformToBlockSave(block.blockDataFactory({ damFileId }));

        expect(transformToBlockSave(block.blockDataFactory(once))).toEqual(once);
    });
});

describe("createDamVideoBlock migrations", () => {
    it("should add a preview image to data from before the exported block had one", () => {
        expect(transformToBlockSave(DamVideoBlock.blockDataFactory({ damFileId }))).toEqual({ damFileId, previewImage: {}, $$version: 1 });
    });

    it("should keep a preview image that the exported block stored without a version", () => {
        expect(transformToBlockSave(DamVideoBlock.blockDataFactory({ damFileId, previewImage: { damFileId } }))).toEqual({
            damFileId,
            previewImage: { damFileId },
            $$version: 1,
        });
    });

    it("should neither migrate nor version data of a block created by the factory", () => {
        const block = createDamVideoBlock({ supports: [] }, "UnmigratedVideo");

        expect(transformToBlockSave(block.blockDataFactory({ damFileId }))).toEqual({ damFileId });
    });

    it("should apply migrations passed to the factory", () => {
        const block = createDamVideoBlock(
            { supports: [] },
            { name: "MigratedVideo", migrate: { version: 1, migrations: typeSafeBlockMigrationPipe([AddLoopMigration]) } },
        );

        expect(transformToBlockSave(block.blockDataFactory({ damFileId }))).toEqual({ damFileId, loop: true, $$version: 1 });
    });
});
