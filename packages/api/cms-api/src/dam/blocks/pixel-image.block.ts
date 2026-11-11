import { Type } from "class-transformer";
import { IsUUID, ValidateNested } from "class-validator";

import {
    type BlockContext,
    BlockData,
    type BlockIndexData,
    BlockInput,
    blockInputToData,
    type BlockMetaField,
    BlockMetaFieldKind,
    createBlock,
} from "../../blocks/block.js";
import { AnnotationBlockMeta } from "../../blocks/decorators/field.js";
import { IsNullable } from "../../common/validators/is-nullable.js";
import { FocalPoint } from "../../file-utils/focal-point.enum.js";
import { DamFileAiContentType } from "../files/entities/ai-content-type.enum.js";
import { FILE_ENTITY } from "../files/entities/file.entity.js";
import type { FilesService } from "../files/files.service.js";
import { ImageCropAreaInput } from "../images/dto/image-crop-area.input.js";
import { ImageCropArea } from "../images/entities/image-crop-area.entity.js";
import type { ImagesService } from "../images/images.service.js";
import { PixelImageBlockTransformerService } from "./pixel-image-block-transformer.service.js";

// @TODO: make factory to support flexible validation
class PixelImageBlockData extends BlockData {
    damFileId: string | null = null;

    @Type(() => ImageCropArea)
    cropArea: ImageCropArea | null = null;

    async transformToPlain() {
        return PixelImageBlockTransformerService;
    }

    async previewImageUrlTemplate(
        { filesService, imagesService }: { filesService: FilesService; imagesService: ImagesService },
        { previewDamUrls }: BlockContext,
    ): Promise<string | undefined> {
        if (!this.damFileId) {
            return undefined;
        }

        const file = await filesService.findOneById(this.damFileId);

        if (!file) {
            return undefined;
        }

        const image = await filesService.findImageToDeliver({ file, cropArea: this.cropArea ?? undefined }, { previewDamUrls });

        return image ? imagesService.createUrlTemplate(image, { previewDamUrls }) : undefined;
    }

    indexData(): BlockIndexData {
        if (!this.damFileId) {
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

class PixelImageBlockInput extends BlockInput {
    @IsNullable()
    @IsUUID()
    damFileId: string | null;

    @Type(() => ImageCropAreaInput)
    @IsNullable()
    @ValidateNested()
    cropArea: ImageCropAreaInput | null;

    transformToBlockData(): PixelImageBlockData {
        return blockInputToData(PixelImageBlockData, this);
    }
}

class Meta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        const ret = super.fields;
        ret.push(
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
                            name: "image",
                            kind: BlockMetaFieldKind.NestedObject,
                            object: {
                                fields: [
                                    {
                                        name: "width",
                                        kind: BlockMetaFieldKind.Number,
                                        nullable: false,
                                    },
                                    {
                                        name: "height",
                                        kind: BlockMetaFieldKind.Number,
                                        nullable: false,
                                    },
                                    cropArea(false),
                                    {
                                        name: "dominantColor",
                                        kind: BlockMetaFieldKind.String,
                                        nullable: true,
                                    },
                                ],
                            },
                            nullable: true,
                        },
                        {
                            name: "fileUrl",
                            kind: BlockMetaFieldKind.String,
                            nullable: false,
                        },
                    ],
                },
            },
            cropArea(true),
            {
                name: "urlTemplate",
                kind: BlockMetaFieldKind.String,
                nullable: false,
            },
        );
        return ret;
    }
}

class InputMeta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        return [
            ...super.fields,
            {
                name: "damFileId",
                kind: BlockMetaFieldKind.String,
                nullable: true,
            },
            cropArea(true),
        ];
    }
}

function cropArea(nullable: boolean): BlockMetaField {
    return {
        name: "cropArea",
        kind: BlockMetaFieldKind.NestedObject,
        nullable,
        object: {
            fields: [
                {
                    name: "focalPoint",
                    kind: BlockMetaFieldKind.Enum,
                    enum: Object.values(FocalPoint),
                    nullable: false,
                },
                {
                    name: "width",
                    kind: BlockMetaFieldKind.Number,
                    nullable: true,
                },
                {
                    name: "height",
                    kind: BlockMetaFieldKind.Number,
                    nullable: true,
                },
                {
                    name: "x",
                    kind: BlockMetaFieldKind.Number,
                    nullable: true,
                },
                {
                    name: "y",
                    kind: BlockMetaFieldKind.Number,
                    nullable: true,
                },
            ],
        },
    };
}

export const PixelImageBlock = createBlock(PixelImageBlockData, PixelImageBlockInput, {
    name: "PixelImage",
    blockMeta: new Meta(PixelImageBlockData),
    blockInputMeta: new InputMeta(PixelImageBlockInput),
});

export type { PixelImageBlockData };
