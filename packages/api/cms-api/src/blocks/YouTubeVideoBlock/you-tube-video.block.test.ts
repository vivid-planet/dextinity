import { describe, expect, it } from "vitest";

import { transformToBlockSave } from "../block";
import { YouTubeVideoBlock } from "./you-tube-video.block";

describe("YouTubeVideoBlock migrations", () => {
    it("migrates block instances that were never migrated", () => {
        const data = YouTubeVideoBlock.blockDataFactory({ youtubeIdentifier: "dQw4w9WgXcQ", aspectRatio: "16x9" });

        expect(transformToBlockSave(data)).toEqual({
            youtubeIdentifier: "dQw4w9WgXcQ",
            previewImage: {},
            $$vendorVersion: 2,
        });
    });

    describe("block instances saved before the migrations moved into the vendor chain", () => {
        it("applies the migrations the instance hasn't run yet", () => {
            const data = YouTubeVideoBlock.blockDataFactory({ youtubeIdentifier: "dQw4w9WgXcQ", $$version: 1 });

            expect(transformToBlockSave(data)).toEqual({
                youtubeIdentifier: "dQw4w9WgXcQ",
                previewImage: {},
                $$vendorVersion: 2,
            });
        });

        it("doesn't migrate a fully migrated instance a second time", () => {
            const previewImage = { damFile: { id: "b6c8d3ba-1b7a-4f2b-8a8e-3b2b4f8c1d2e" } };
            const data = YouTubeVideoBlock.blockDataFactory({ youtubeIdentifier: "dQw4w9WgXcQ", previewImage, $$version: 2 });

            expect(transformToBlockSave(data)).toEqual({
                youtubeIdentifier: "dQw4w9WgXcQ",
                previewImage,
                $$vendorVersion: 2,
            });
        });
    });
});
