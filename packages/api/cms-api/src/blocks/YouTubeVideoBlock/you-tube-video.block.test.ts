import { describe, expect, it } from "vitest";

import { blockInputToData, createBlock, transformToBlockSave } from "../block";
import { BlockField } from "../decorators/field";
import { BlockMigration } from "../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../migrations/types";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe";
import { YouTubeVideoBlock, YouTubeVideoBlockData, YouTubeVideoBlockInput } from "./you-tube-video.block";

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

describe("a block extending YouTubeVideoBlock", () => {
    interface From {
        youtubeIdentifier?: string;
    }

    interface To extends From {
        caption: string;
    }

    class AddCaptionMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
        // The migrations shipped with YouTubeVideoBlock count on their own, so this one starts at 1
        public readonly toVersion = 1;

        protected migrate(from: From): To {
            return { ...from, caption: "" };
        }
    }

    class CaptionedYouTubeVideoBlockData extends YouTubeVideoBlockData {
        @BlockField()
        caption: string;
    }

    class CaptionedYouTubeVideoBlockInput extends YouTubeVideoBlockInput {
        @BlockField()
        caption: string;

        transformToBlockData(): CaptionedYouTubeVideoBlockData {
            return blockInputToData(CaptionedYouTubeVideoBlockData, this);
        }
    }

    const CaptionedYouTubeVideoBlock = createBlock(CaptionedYouTubeVideoBlockData, CaptionedYouTubeVideoBlockInput, {
        name: "CaptionedYouTubeVideo",
        migrate: { version: 1, migrations: typeSafeBlockMigrationPipe([AddCaptionMigration]) },
    });

    it("runs the migrations shipped with the block it extends, then its own", () => {
        const data = CaptionedYouTubeVideoBlock.blockDataFactory({ youtubeIdentifier: "dQw4w9WgXcQ", aspectRatio: "16x9" });

        expect(transformToBlockSave(data)).toEqual({
            youtubeIdentifier: "dQw4w9WgXcQ",
            previewImage: {},
            caption: "",
            $$version: 1,
            $$vendorVersion: 2,
        });
    });

    it("keeps both chains apart for a block instance that only ran one of them", () => {
        const data = CaptionedYouTubeVideoBlock.blockDataFactory({ youtubeIdentifier: "dQw4w9WgXcQ", previewImage: {}, $$vendorVersion: 2 });

        expect(transformToBlockSave(data)).toEqual({
            youtubeIdentifier: "dQw4w9WgXcQ",
            previewImage: {},
            caption: "",
            $$version: 1,
            $$vendorVersion: 2,
        });
    });

    it("doesn't migrate a block instance that is up to date in both chains", () => {
        const data = CaptionedYouTubeVideoBlock.blockDataFactory({
            youtubeIdentifier: "dQw4w9WgXcQ",
            previewImage: {},
            caption: "A caption",
            $$version: 1,
            $$vendorVersion: 2,
        });

        expect(transformToBlockSave(data)).toEqual({
            youtubeIdentifier: "dQw4w9WgXcQ",
            previewImage: {},
            caption: "A caption",
            $$version: 1,
            $$vendorVersion: 2,
        });
    });
});
