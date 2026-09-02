import { IsBoolean, IsOptional, IsUUID } from "class-validator";

import {
    type Block,
    BlockData,
    type BlockDataInterface,
    type BlockIndexData,
    BlockInput,
    type BlockMetaField,
    BlockMetaFieldKind,
    createBlock,
    type ExtractBlockInput,
    getRegisteredBlocks,
    type MigrateOptions,
    type SimpleBlockInputInterface,
} from "../../../blocks/block";
import { ChildBlock } from "../../../blocks/decorators/child-block";
import { ChildBlockInput } from "../../../blocks/decorators/child-block-input";
import { AnnotationBlockMeta, BlockField } from "../../../blocks/decorators/field";
import { typeSafeBlockMigrationPipe } from "../../../blocks/migrations/typeSafeBlockMigrationPipe";
import { DamFileAiContentType } from "../../files/entities/ai-content-type.enum";
import { FILE_ENTITY } from "../../files/entities/file.entity";
import { PixelImageBlock } from "../pixel-image.block";
import { DamVideoBlockTransformerService } from "./dam-video-block-transformer.service";
import { AddPreviewImageMigration } from "./migrations/1-add-preview-image.migration";

/**
 * What the block stores besides the video file itself:
 * - `"controls"` — the playback options autoplay, loop and show controls. Bundled because autoplay and
 *   show controls depend on each other (a video with neither can't be played), so they're all offered or none.
 * - `"previewImage"` — the poster image shown before playback.
 */
export type DamVideoBlockSupports = "controls" | "previewImage";

const defaultSupports: DamVideoBlockSupports[] = ["controls", "previewImage"];

interface CreateDamVideoBlockOptions {
    /**
     * What the block stores besides the video file itself. Leave out anything the site implementation
     * doesn't use, for instance `["controls"]` for a site that renders no poster image, or `[]` for a site
     * that only reads the file's URL. Anything left out is neither part of the block's data nor of its input.
     * @default ["controls", "previewImage"]
     */
    supports?: DamVideoBlockSupports[];
}

export interface DamVideoBlockDataInterface extends BlockDataInterface {
    damFileId?: string;
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
    previewImage?: BlockDataInterface;
}

interface DamVideoBlockInputInterface extends SimpleBlockInputInterface {
    damFileId?: string;
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
    previewImage?: ExtractBlockInput<typeof PixelImageBlock>;
}

export function createDamVideoBlock(
    options: CreateDamVideoBlockOptions = {},
    name = "DamVideo",
): Block<BlockDataInterface, DamVideoBlockInputInterface> {
    // A block created by the factory has no data from an earlier version, so it starts at version 1 without migrations.
    return createDamVideoBlockWithMigrations({ ...options, name, migrations: [] });
}

interface CreateDamVideoBlockWithMigrationsOptions extends CreateDamVideoBlockOptions {
    name: string;
    migrations: MigrateOptions["migrations"];
}

function createDamVideoBlockWithMigrations({
    supports = defaultSupports,
    name,
    migrations,
}: CreateDamVideoBlockWithMigrationsOptions): Block<BlockDataInterface, DamVideoBlockInputInterface> {
    if (getRegisteredBlocks().some((block) => block.name === name)) {
        throw new Error(
            `A block named "${name}" is already registered. @dextinity/cms-api exports a ready-made DamVideoBlock, so a block created with createDamVideoBlock needs its own name, for instance createDamVideoBlock({ supports: [] }, "TeaserVideo").`,
        );
    }

    const supportsControls = supports.includes("controls");
    const supportsPreviewImage = supports.includes("previewImage");

    const unsupportedFields = supportsControls ? [] : ["autoplay", "showControls", "loop"];
    const isSupported = (field: BlockMetaField) => !unsupportedFields.includes(field.name);

    class DamVideoBlockData extends BlockData {
        damFileId?: string;

        @BlockField({ type: "boolean", nullable: true })
        autoplay?: boolean;

        @BlockField({ type: "boolean", nullable: true })
        showControls?: boolean;

        @BlockField({ type: "boolean", nullable: true })
        loop?: boolean;

        previewImage?: BlockDataInterface;

        async transformToPlain() {
            return DamVideoBlockTransformerService;
        }

        indexData(): BlockIndexData {
            if (this.damFileId === undefined) {
                return {};
            }

            return {
                dependencies: [
                    {
                        targetEntityName: FILE_ENTITY,
                        id: this.damFileId,
                    },
                ],
            };
        }
    }

    class DamVideoBlockInput extends BlockInput {
        @IsBoolean()
        @IsOptional()
        @BlockField({ type: "boolean", nullable: true })
        autoplay?: boolean;

        @IsBoolean()
        @IsOptional()
        @BlockField({ type: "boolean", nullable: true })
        showControls?: boolean;

        @IsBoolean()
        @IsOptional()
        @BlockField({ type: "boolean", nullable: true })
        loop?: boolean;

        previewImage?: ExtractBlockInput<typeof PixelImageBlock>;

        damFileId?: string;

        transformToBlockData(): BlockDataInterface {
            const data = new DamVideoBlockData();

            data.damFileId = this.damFileId;

            if (supportsControls) {
                data.autoplay = this.autoplay;
                data.showControls = this.showControls;
                data.loop = this.loop;
            }

            if (supportsPreviewImage) {
                data.previewImage = this.previewImage?.transformToBlockData();
            }

            return data;
        }
    }

    // The child block decorators reject a missing preview image, so they may only be applied when it is
    // supported. damFileId follows, because the block meta lists the fields in the order they are applied.
    if (supportsPreviewImage) {
        ChildBlock(PixelImageBlock)(DamVideoBlockData.prototype, "previewImage");
        ChildBlockInput(PixelImageBlock)(DamVideoBlockInput.prototype, "previewImage");
    }

    IsUUID()(DamVideoBlockInput.prototype, "damFileId");
    IsOptional()(DamVideoBlockInput.prototype, "damFileId");
    BlockField({ type: "string", nullable: true })(DamVideoBlockInput.prototype, "damFileId");

    class Meta extends AnnotationBlockMeta {
        get fields(): BlockMetaField[] {
            return [
                ...super.fields.filter(isSupported),
                {
                    name: "damFile",
                    kind: BlockMetaFieldKind.NestedObject,
                    nullable: true,
                    object: {
                        fields: [
                            {
                                name: "id",
                                kind: BlockMetaFieldKind.String,
                                nullable: false,
                            },
                            {
                                name: "name",
                                kind: BlockMetaFieldKind.String,
                                nullable: false,
                            },
                            {
                                name: "size",
                                kind: BlockMetaFieldKind.Number,
                                nullable: false,
                            },
                            {
                                name: "mimetype",
                                kind: BlockMetaFieldKind.String,
                                nullable: false,
                            },
                            {
                                name: "contentHash",
                                kind: BlockMetaFieldKind.String,
                                nullable: false,
                            },
                            {
                                name: "title",
                                kind: BlockMetaFieldKind.String,
                                nullable: true,
                            },
                            {
                                name: "altText",
                                kind: BlockMetaFieldKind.String,
                                nullable: true,
                            },
                            {
                                name: "aiContentType",
                                kind: BlockMetaFieldKind.Enum,
                                enum: Object.values(DamFileAiContentType),
                                nullable: true,
                            },
                            {
                                name: "archived",
                                kind: BlockMetaFieldKind.Boolean,
                                nullable: false,
                            },
                            {
                                name: "scope",
                                kind: BlockMetaFieldKind.Json,
                                nullable: true,
                            },
                            {
                                name: "fileUrl",
                                kind: BlockMetaFieldKind.String,
                                nullable: false,
                            },
                            {
                                name: "captions",
                                kind: BlockMetaFieldKind.NestedObjectList,
                                nullable: true,
                                object: {
                                    fields: [
                                        {
                                            name: "id",
                                            kind: BlockMetaFieldKind.String,
                                            nullable: false,
                                        },
                                        {
                                            name: "language",
                                            kind: BlockMetaFieldKind.String,
                                            nullable: false,
                                        },
                                        {
                                            name: "fileUrl",
                                            kind: BlockMetaFieldKind.String,
                                            nullable: false,
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ];
        }
    }

    class InputMeta extends AnnotationBlockMeta {
        get fields(): BlockMetaField[] {
            return super.fields.filter(isSupported);
        }
    }

    return createBlock(DamVideoBlockData, DamVideoBlockInput, {
        name,
        blockMeta: new Meta(DamVideoBlockData),
        blockInputMeta: new InputMeta(DamVideoBlockInput),
        migrate: {
            version: 1,
            migrations,
        },
    });
}

export const DamVideoBlock = createDamVideoBlockWithMigrations({
    name: "DamVideo",
    migrations: typeSafeBlockMigrationPipe([AddPreviewImageMigration]),
});
