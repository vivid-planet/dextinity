import { IsString, IsUUID } from "class-validator";

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
import { PAGE_TREE_ENTITY } from "../page-tree.constants.js";
import { PageExists } from "../validators/page-exists.validator.js";
import { InternalLinkBlockTransformerService } from "./internal-link-block-transformer.service.js";
import { InternalLinkBlockWarningsService } from "./internal-link-block-warnings.service.js";

class InternalLinkBlockData extends BlockData {
    targetPageId: string | null = null;

    @BlockField({ type: "string", nullable: true })
    targetPageAnchor: string | null;

    async transformToPlain() {
        return InternalLinkBlockTransformerService;
    }

    indexData(): BlockIndexData {
        if (!this.targetPageId) {
            return {};
        }

        return {
            dependencies: [
                {
                    targetEntityName: PAGE_TREE_ENTITY,
                    id: this.targetPageId,
                },
            ],
        };
    }

    warnings() {
        return InternalLinkBlockWarningsService;
    }
}

class InternalLinkBlockInput extends BlockInput {
    @BlockField({ type: "string", nullable: true })
    @IsNullable()
    @IsUUID()
    @PageExists()
    targetPageId: string | null;

    @BlockField({ type: "string", nullable: true })
    @IsNullable()
    @IsString()
    targetPageAnchor: string | null;

    transformToBlockData(): InternalLinkBlockData {
        return blockInputToData(InternalLinkBlockData, this);
    }
}

class Meta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        return [
            ...super.fields,
            {
                name: "targetPage",
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
                            name: "path",
                            kind: BlockMetaFieldKind.String,
                            nullable: false,
                        },
                        {
                            name: "scope",
                            kind: BlockMetaFieldKind.Json,
                            nullable: true,
                        },
                        {
                            name: "documentType",
                            kind: BlockMetaFieldKind.String,
                            nullable: false,
                        },
                    ],
                },
            },
        ];
    }
}

export const InternalLinkBlock = createBlock(InternalLinkBlockData, InternalLinkBlockInput, {
    name: "InternalLink",
    blockMeta: new Meta(InternalLinkBlockData),
});

export type { InternalLinkBlockData, InternalLinkBlockInput };
