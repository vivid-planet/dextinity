import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

import {
    BlockContext,
    BlockData,
    BlockIndexData,
    BlockInput,
    blockInputToData,
    BlockMetaField,
    BlockMetaFieldKind,
    createBlock,
} from "../../blocks/block";
import { AnnotationBlockMeta } from "../../blocks/decorators/field";
import { FocalPoint } from "../../file-utils/focal-point.enum";
import { DamFileAiContentType } from "../files/entities/ai-content-type.enum";
import { FILE_ENTITY } from "../files/entities/file.entity";
import { FilesService } from "../files/files.service";
import { ImageCropAreaInput } from "../images/dto/image-crop-area.input";
import { ImageCropArea } from "../images/entities/image-crop-area.entity";
import { ImagesService } from "../images/images.service";
import { PixelImageBlockTransformerService } from "./pixel-image-block-transformer.service";

// @TODO: make factory to support flexible validation
class PixelImageBlockData extends BlockData {
    damFileId?: string;

    @Type(() => ImageCropArea)
    cropArea?: ImageCropArea;

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

        return imagesService.createUrlTemplate({ file, cropArea: this.cropArea }, { previewDamUrls });
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

class PixelImageBlockInput extends BlockInput {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    damFileId?: string;

    @Type(() => ImageCropAreaInput)
    @IsOptional()
    @ValidateNested()
    cropArea?: ImageCropAreaInput;

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
