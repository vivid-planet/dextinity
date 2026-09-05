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

    it("should add a preview image to data from before the exported block had one", () => {
        expect(transformToBlockSave(DamVideoBlock.blockDataFactory({ damFileId }))).toEqual({ damFileId, previewImage: {}, $$version: 1 });
    });

    it("should neither migrate nor version data of a block created by the factory", () => {
        const block = createDamVideoBlock({}, "UnmigratedVideo");

        expect(transformToBlockSave(block.blockDataFactory({ damFileId }))).toEqual({ damFileId });
    });

    it("should apply migrations passed to the factory", () => {
        const block = createDamVideoBlock(
            {},
            { name: "MigratedVideo", migrate: { version: 1, migrations: typeSafeBlockMigrationPipe([AddLoopMigration]) } },
        );

        expect(transformToBlockSave(block.blockDataFactory({ damFileId }))).toEqual({ damFileId, loop: true, $$version: 1 });
    });

    it("should reject a name that is already registered", () => {
        expect(() => createDamVideoBlock({ supports: [] })).toThrow(/already registered/);
    });
});
