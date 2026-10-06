import { IsNotEmpty, IsOptional, IsString } from "class-validator";

import {
    BlockData,
    type BlockIndexData,
    BlockInput,
    blockInputToData,
    type BlockMetaField,
    BlockMetaFieldKind,
    createBlock,
} from "../../blocks/block.js";
import { AnnotationBlockMeta } from "../../blocks/decorators/field.js";
import { FILE_ENTITY } from "../files/entities/file.entity.js";
import { SvgImageBlockTransformerService } from "./svg-image-block-transformer.service.js";

class SvgImageBlockData extends BlockData {
    damFileId?: string;

    async transformToPlain() {
        return SvgImageBlockTransformerService;
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

class SvgImageBlockInput extends BlockInput {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    damFileId?: string;

    transformToBlockData(): SvgImageBlockData {
        return blockInputToData(SvgImageBlockData, this);
    }
}

class Meta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        const ret = super.fields;
        ret.push({
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
                ],
            },
        });
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
        ];
    }
}

export const SvgImageBlock = createBlock(SvgImageBlockData, SvgImageBlockInput, {
    name: "SvgImage",
    blockMeta: new Meta(SvgImageBlockData),
    blockInputMeta: new InputMeta(SvgImageBlockInput),
});

export type { SvgImageBlockData };
