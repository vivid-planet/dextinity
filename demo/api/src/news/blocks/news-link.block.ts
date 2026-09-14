import {
    AnnotationBlockMeta,
    BlockData,
    BlockField,
    BlockIndexData,
    BlockInput,
    blockInputToData,
    BlockMetaField,
    BlockMetaFieldKind,
    createBlock,
} from "@dextinity/cms-api";
import { IsOptional, IsUUID } from "class-validator";

import { NewsLinkBlockTransformerService } from "./news-link-block-transformer.service";

class NewsLinkBlockData extends BlockData {
    @BlockField({ nullable: true })
    id?: string;

    indexData(): BlockIndexData {
        if (this.id === undefined) {
            return {};
        }

        return {
            dependencies: [
                {
                    targetEntityName: "News",
                    id: this.id,
                },
            ],
        };
    }

    async transformToPlain() {
        return NewsLinkBlockTransformerService;
    }
}

class Meta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        return [
            ...super.fields,
            {
                name: "news",
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
                            name: "slug",
                            kind: BlockMetaFieldKind.String,
                            nullable: false,
                        },
                        {
                            name: "scope",
                            kind: BlockMetaFieldKind.NestedObject,
                            nullable: false,
                            object: {
                                fields: [
                                    {
                                        name: "domain",
                                        kind: BlockMetaFieldKind.String,
                                        nullable: false,
                                    },
                                    {
                                        name: "language",
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

class NewsLinkBlockInput extends BlockInput {
    @BlockField({ nullable: true })
    @IsUUID()
    @IsOptional()
    id?: string;

    transformToBlockData(): NewsLinkBlockData {
        return blockInputToData(NewsLinkBlockData, this);
    }
}

const NewsLinkBlock = createBlock(NewsLinkBlockData, NewsLinkBlockInput, { name: "NewsLink", blockMeta: new Meta(NewsLinkBlockData) });

export { NewsLinkBlock, NewsLinkBlockData };
