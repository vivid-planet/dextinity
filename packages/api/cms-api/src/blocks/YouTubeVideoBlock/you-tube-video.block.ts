import { IsString } from "class-validator";

import { IsNullable } from "../../common/validators/is-nullable.js";
import { BaseVideoBlockData, BaseVideoBlockInput } from "../base-video-block.js";
import { type BlockDataInterface, blockInputToData, createBlock } from "../block.js";
import { BlockField } from "../decorators/field.js";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe.js";
import { IsValidYouTubeIdentifier } from "../validator/is-valid-you-tube-identifier.js";
import { RemoveAspectRatioMigration } from "./migrations/1-remove-aspect-ratio.migration.js";
import { AddPreviewImageMigration } from "./migrations/2-add-preview-image.migration.js";

class YouTubeVideoBlockData extends BaseVideoBlockData {
    @BlockField({ type: "string", nullable: true })
    youtubeIdentifier: string | null;
}

class YouTubeVideoBlockInput extends BaseVideoBlockInput {
    @IsNullable()
    @IsString()
    @BlockField({ type: "string", nullable: true })
    @IsValidYouTubeIdentifier()
    youtubeIdentifier: string | null;

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
