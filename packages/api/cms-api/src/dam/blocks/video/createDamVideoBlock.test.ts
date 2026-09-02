import { describe, expect, it } from "vitest";

import { transformToBlockSave } from "../../../blocks/block";
import { createDamVideoBlock, DamVideoBlock } from "./createDamVideoBlock";

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

    it("should add a preview image to data from before the exported block had one", () => {
        expect(transformToBlockSave(DamVideoBlock.blockDataFactory({ damFileId }))).toEqual({ damFileId, previewImage: {}, $$version: 1 });
    });

    it("should not migrate data of a block created by the factory", () => {
        const block = createDamVideoBlock({}, "UnmigratedVideo");

        expect(transformToBlockSave(block.blockDataFactory({ damFileId }))).toEqual({ damFileId, $$version: 1 });
    });

    it("should reject a name that is already registered", () => {
        expect(() => createDamVideoBlock({ supports: [] })).toThrow(/already registered/);
    });
});
