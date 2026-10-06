import { IsOptional, IsString } from "class-validator";

import { BaseVideoBlockData, BaseVideoBlockInput } from "../base-video-block.js";
import { type BlockDataInterface, blockInputToData, createBlock } from "../block.js";
import { BlockField } from "../decorators/field.js";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe.js";
import { IsValidYouTubeIdentifier } from "../validator/is-valid-you-tube-identifier.js";
import { RemoveAspectRatioMigration } from "./migrations/1-remove-aspect-ratio.migration.js";
import { AddPreviewImageMigration } from "./migrations/2-add-preview-image.migration.js";

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
    migrate: {
        version: 2,
        migrations: typeSafeBlockMigrationPipe([RemoveAspectRatioMigration, AddPreviewImageMigration]),
    },
});
