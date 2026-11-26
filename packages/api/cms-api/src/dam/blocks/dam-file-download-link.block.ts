import { IsEnum, IsUUID } from "class-validator";

import {
    BlockData,
    type BlockIndexData,
    BlockInput,
    blockInputToData,
    type BlockMetaField,
    BlockMetaFieldKind,
    createBlock,
} from "../../blocks/block.js";
import { AnnotationBlockMeta, BlockField } from "../../blocks/decorators/field.js";
import { IsNullable } from "../../common/validators/is-nullable.js";
import { FILE_ENTITY } from "../files/entities/file.entity.js";
import { DamFileDownloadLinkBlockTransformerService } from "./dam-file-download-link-block-transformer.service.js";

export enum OpenFileTypeMethod {
    NewTab = "NewTab",
    Download = "Download",
}

export class DamFileDownloadLinkBlockData extends BlockData {
    fileId: string | null = null;

    @BlockField({ type: "enum", enum: OpenFileTypeMethod })
    openFileType: OpenFileTypeMethod;

    async transformToPlain() {
        return DamFileDownloadLinkBlockTransformerService;
    }

    indexData(): BlockIndexData {
        if (!this.fileId) {
            return {};
        }

        return {
            dependencies: [
                {
                    targetEntityName: FILE_ENTITY,
                    id: this.fileId,
                },
            ],
        };
    }
}

class DamFileDownloadLinkBlockInput extends BlockInput {
    @IsNullable()
    @IsUUID()
    @BlockField({ type: "string", nullable: true })
    fileId: string | null;

    @IsEnum(OpenFileTypeMethod)
    @BlockField({ type: "enum", enum: OpenFileTypeMethod })
    openFileType: OpenFileTypeMethod;

    transformToBlockData(): DamFileDownloadLinkBlockData {
        return blockInputToData(DamFileDownloadLinkBlockData, this);
    }
}

class Meta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        return [
            {
                name: "file",
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
                            name: "fileUrl",
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
                            name: "scope",
                            kind: BlockMetaFieldKind.Json,
                            nullable: true,
                        },
                        {
                            name: "altText",
                            kind: BlockMetaFieldKind.String,
                            nullable: true,
                        },
                        {
                            name: "title",
                            kind: BlockMetaFieldKind.String,
                            nullable: true,
                        },
                    ],
                },
            },
            ...super.fields,
        ];
    }
}

export const DamFileDownloadLinkBlock = createBlock(DamFileDownloadLinkBlockData, DamFileDownloadLinkBlockInput, {
    name: "DamFileDownloadLink",
    blockMeta: new Meta(DamFileDownloadLinkBlockData),
});
