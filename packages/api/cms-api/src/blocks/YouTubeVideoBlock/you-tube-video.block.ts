import { IsOptional, IsString } from "class-validator";

import { BaseVideoBlockData, BaseVideoBlockInput } from "../base-video-block";
import { BlockDataInterface, blockInputToData, createBlock } from "../block";
import { BlockField } from "../decorators/field";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe";
import { IsValidYouTubeIdentifier } from "../validator/is-valid-you-tube-identifier";
import { RemoveAspectRatioMigration } from "./migrations/1-remove-aspect-ratio.migration";
import { AddPreviewImageMigration } from "./migrations/2-add-preview-image.migration";

class YouTubeVideoBlockData extends BaseVideoBlockData {
    @BlockField({ nullable: true })
    youtubeIdentifier?: string;
}

class YouTubeVideoBlockInput extends BaseVideoBlockInput {
    @IsOptional()
    @IsString()
    @BlockField({ nullable: true })
    @IsValidYouTubeIdentifier()
    youtubeIdentifier?: string;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(YouTubeVideoBlockData, this);
    }
}

export const YouTubeVideoBlock = createBlock(YouTubeVideoBlockData, YouTubeVideoBlockInput, {
    name: "YouTubeVideo",
    migrateVendor: {
        version: 2,
        migrations: typeSafeBlockMigrationPipe([RemoveAspectRatioMigration, AddPreviewImageMigration]),
        // Both migrations counted in the block's version before they moved into the vendor chain
        legacyVersions: 2,
    },
});
