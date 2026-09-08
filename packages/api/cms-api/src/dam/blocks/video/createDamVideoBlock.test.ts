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
    public readonly toVersion = 2;

    protected migrate(props: { damFileId?: string }) {
        return { ...props, loop: true };
    }
}

class ReservedVersionMigration extends BlockMigration<(from: { damFileId?: string }) => { damFileId?: string }> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(props: { damFileId?: string }) {
        return props;
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

        expect(transformToBlockSave(input.transformToBlockData())).toEqual({ damFileId, $$version: 1 });
    });

    it("should create input for a block without a preview image", () => {
        const block = createDamVideoBlock({ supports: ["controls"] }, "InputWithoutPreviewImage");
        const input = block.blockInputFactory({ damFileId, autoplay: true });

        expect(transformToBlockSave(input.transformToBlockData())).toEqual({ damFileId, autoplay: true, $$version: 1 });
    });

    it("should create input for a block that supports nothing but the file", () => {
        const block = createDamVideoBlock({ supports: [] }, "InputWithFileOnly");
        const input = block.blockInputFactory({ damFileId });

        expect(transformToBlockSave(input.transformToBlockData())).toEqual({ damFileId, $$version: 1 });
    });

    it("should store the supported options", () => {
        const block = createDamVideoBlock({}, "StoringFullVideo");
        const input = block.blockInputFactory({ damFileId, autoplay: true, previewImage: {} });

        expect(transformToBlockSave(input.transformToBlockData())).toEqual({ damFileId, autoplay: true, previewImage: {}, $$version: 1 });
    });

    it("should require a preview image in the input when it is supported", () => {
        const block = createDamVideoBlock({}, "InputRequiringPreviewImage");

        expect(() => block.blockInputFactory({ damFileId })).toThrow(/Missing child block input for 'previewImage'/);
    });

    it("should reject a name that is already registered", () => {
        expect(() => createDamVideoBlock({ supports: [] })).toThrow(/already registered/);
    });
});

describe("createDamVideoBlock migrations", () => {
    // Content stored before the block gained its preview image: neither a version nor a preview image.
    const legacyData = { damFileId, autoplay: true, showControls: true, loop: false };

    it("should add a preview image to data from before the exported block had one", () => {
        expect(transformToBlockSave(DamVideoBlock.blockDataFactory({ damFileId }))).toEqual({ damFileId, previewImage: {}, $$version: 1 });
    });

    it("should migrate and version data of a block created by the factory", () => {
        const block = createDamVideoBlock({}, "MigratedByTheFactory");

        expect(transformToBlockSave(block.blockDataFactory(legacyData))).toEqual({ ...legacyData, previewImage: {}, $$version: 1 });
    });

    it("should read the migrated preview image as a child block", () => {
        const block = createDamVideoBlock({}, "MigratedPreviewImageIsAChildBlock");
        const data = block.blockDataFactory(legacyData);

        expect(data.previewImage?.constructor.name).toBe("PixelImageBlockData");
        expect(data.childBlocksInfo().map((child) => child.name)).toEqual(["PixelImage"]);
    });

    it("should keep a preview image that was stored without a version", () => {
        const block = createDamVideoBlock({}, "KeepingAnUnversionedPreviewImage");
        const data = block.blockDataFactory({ damFileId, previewImage: { damFileId } });

        expect(transformToBlockSave(data)).toEqual({ damFileId, previewImage: { damFileId }, $$version: 1 });
    });

    it("should only version data of a block that doesn't support a preview image", () => {
        const block = createDamVideoBlock({ supports: ["controls"] }, "VersionedWithoutPreviewImage");

        expect(transformToBlockSave(block.blockDataFactory(legacyData))).toEqual({ ...legacyData, $$version: 1 });
    });

    it("should migrate only once", () => {
        const block = createDamVideoBlock({}, "MigratingOnlyOnce");
        const migrated = transformToBlockSave(block.blockDataFactory(legacyData));

        expect(transformToBlockSave(block.blockDataFactory(migrated))).toEqual(migrated);
    });

    it("should apply migrations passed to the factory after its own", () => {
        const block = createDamVideoBlock(
            {},
            { name: "MigratedVideo", migrate: { version: 2, migrations: typeSafeBlockMigrationPipe([AddLoopMigration]) } },
        );

        expect(transformToBlockSave(block.blockDataFactory({ damFileId }))).toEqual({ damFileId, previewImage: {}, loop: true, $$version: 2 });
    });

    it("should apply a migration passed to the factory to data that is already at the reserved version", () => {
        const block = createDamVideoBlock(
            {},
            { name: "MigratedVideoFromVersionOne", migrate: { version: 2, migrations: typeSafeBlockMigrationPipe([AddLoopMigration]) } },
        );

        expect(transformToBlockSave(block.blockDataFactory({ damFileId, previewImage: {}, $$version: 1 }))).toEqual({
            damFileId,
            previewImage: {},
            loop: true,
            $$version: 2,
        });
    });

    it("should reject a version that is reserved for the factory", () => {
        expect(() =>
            createDamVideoBlock({}, { name: "ReservedVersion", migrate: { version: 1, migrations: typeSafeBlockMigrationPipe([AddLoopMigration]) } }),
        ).toThrow(/version=1 is reserved for createDamVideoBlock/);
    });

    it("should reject a migration whose version is reserved for the factory", () => {
        expect(() =>
            createDamVideoBlock(
                {},
                { name: "ReservedToVersion", migrate: { version: 2, migrations: typeSafeBlockMigrationPipe([ReservedVersionMigration]) } },
            ),
        ).toThrow(/toVersion=1 is reserved for createDamVideoBlock/);
    });
});
