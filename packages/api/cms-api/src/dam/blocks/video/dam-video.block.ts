import { IsOptional, IsUUID } from "class-validator";

import { BaseVideoBlockData, BaseVideoBlockInput } from "../../../blocks/base-video-block";
import { BlockDataInterface, BlockIndexData, blockInputToData, BlockMetaField, BlockMetaFieldKind, createBlock } from "../../../blocks/block";
import { AnnotationBlockMeta, BlockField } from "../../../blocks/decorators/field";
import { typeSafeBlockMigrationPipe } from "../../../blocks/migrations/typeSafeBlockMigrationPipe";
import { DamFileAiContentType } from "../../files/entities/ai-content-type.enum";
import { FILE_ENTITY } from "../../files/entities/file.entity";
import { DamVideoBlockTransformerService } from "./dam-video-block-transformer.service";
import { AddPreviewImageMigration } from "./migrations/1-add-preview-image.migration";

class DamVideoBlockData extends BaseVideoBlockData {
    damFileId?: string;

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

class DamVideoBlockInput extends BaseVideoBlockInput {
    @BlockField({ nullable: true })
    @IsUUID()
    @IsOptional()
    damFileId?: string;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(DamVideoBlockData, this);
    }
}

class Meta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        return [
            ...super.fields,
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

export const DamVideoBlock = createBlock(DamVideoBlockData, DamVideoBlockInput, {
    name: "DamVideo",
    blockMeta: new Meta(DamVideoBlockData),
    migrate: {
        version: 1,
        migrations: typeSafeBlockMigrationPipe([AddPreviewImageMigration]),
    },
});

export type { DamVideoBlockData };
