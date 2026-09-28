import { Type } from "@nestjs/common";
import { plainToInstance, Transform } from "class-transformer";
import { ArrayMinSize, IsIn, IsOptional, IsString, ValidateNested } from "class-validator";

import {
    Block,
    BlockContext,
    BlockData,
    BlockDataInterface,
    BlockInput,
    BlockInputInterface,
    BlockMetaField,
    BlockMetaFieldKind,
    BlockMetaInterface,
    ChildBlockInfo,
    createBlock,
    ExtractBlockData,
    ExtractBlockInput,
    isBlockDataInterface,
    isBlockInputInterface,
    MigrateOptions,
    SimpleBlockInputInterface,
    TraversableTransformBlockResponse,
} from "../block";
import { AnnotationBlockMeta, BlockField } from "../decorators/field";
import { BlockFactoryNameOrOptions } from "./types";

type BaseBlockMap = Record<string, Block<BlockDataInterface, BlockInputInterface>>;

type OneOfBlockDataInterface<BlockMap extends BaseBlockMap, Data extends BlockDataInterface> = Data & {
    attachedBlocks: SupportedBlocksDataInterfaces<BlockMap>[];
    activeType?: keyof BlockMap;
};

type SupportedBlocksDataInterfaces<BlockMap extends BaseBlockMap> = {
    [Typename in keyof BlockMap]: BlockDataInterface & {
        type: Typename;
        props: ExtractBlockData<BlockMap[Typename]>;
    };
}[keyof BlockMap];

type OneOfBlockInputInterface<
    BlockMap extends BaseBlockMap,
    Data extends BlockDataInterface,
    Input extends SimpleBlockInputInterface<Data>,
> = Input & {
    attachedBlocks: SupportedBlocksInputInterfaces<BlockMap>[];
    activeType?: keyof BlockMap;
};

type SupportedBlocksInputInterfaces<BlockMap extends BaseBlockMap> = {
    [Typename in keyof BlockMap]: SimpleBlockInputInterface & {
        type: Typename;
        props: ExtractBlockInput<BlockMap[Typename]>;
    };
}[keyof BlockMap];

interface OneOfBlockItemDataInterface extends BlockData {
    type: string;
    props: BlockDataInterface;
}

export function BaseOneOfBlockItemData<BlockMap extends BaseBlockMap>({
    supportedBlocks,
}: {
    supportedBlocks: BlockMap;
}): Type<OneOfBlockItemDataInterface> {
    class OneOfBlockItemData extends BlockData {
        @BlockField()
        type: string;

        @Transform(
            ({ value, obj }) => {
                const blockType = obj.type as string;
                const block = supportedBlocks[blockType];

                if (!block) {
                    throw new Error(`unknown type ${blockType}`);
                }

                return isBlockDataInterface(value) ? value : block.blockDataFactory(value);
            },
            { toClassOnly: true },
        )
        @BlockField({ kind: "oneOfBlocks", blocks: supportedBlocks })
        props: BlockData;

        async transformToPlain(): Promise<TraversableTransformBlockResponse> {
            return {
                type: this.type,
                props: this.props,
            };
        }
    }

    return OneOfBlockItemData;
}

export function BaseOneOfBlockData<BlockMap extends BaseBlockMap, Data extends BlockDataInterface = BlockDataInterface>({
    supportedBlocks,
    OneOfBlockItemData,
}: {
    supportedBlocks: BlockMap;
    OneOfBlockItemData: Type<OneOfBlockItemDataInterface>;
}): Type<OneOfBlockDataInterface<BlockMap, Data>> {
    class OneOfBlockData extends BlockData {
        @Transform(({ value }: { value: OneOfBlockItemDataInterface[] }) =>
            value
                .filter((item) => {
                    if (!supportedBlocks[item.type]) {
                        console.warn(`Unknown block type "${item.type}"`);
                        return false;
                    }

                    return true;
                })
                .map((item) => plainToInstance(OneOfBlockItemData, item)),
        )
        attachedBlocks: OneOfBlockDataInterface<BlockMap, Data>["attachedBlocks"][number][];

        // index of blocks
        activeType?: string;

        async transformToPlain({ includeInvisibleContent }: BlockContext): Promise<TraversableTransformBlockResponse> {
            const { attachedBlocks, activeType, ...additionalFields } = this;
            const block = attachedBlocks.find((c) => c.type === this.activeType);
            return {
                attachedBlocks: includeInvisibleContent ? attachedBlocks : [], // only admin must see inactive blocks
                block: block,
                activeType: activeType && supportedBlocks[activeType] ? activeType : undefined,
                ...additionalFields,
            };
        }

        childBlocksInfo(): ChildBlockInfo[] {
            return this.attachedBlocks.map((childBlock, index) => {
                const blockConfig = supportedBlocks[childBlock.type];

                return {
                    visible: this.activeType === childBlock.type,
                    relJsonPath: ["attachedBlocks", index, "props"],
                    block: childBlock.props,
                    name: blockConfig.name,
                };
            });
        }
    }

    // Type cast to suppress error: 'OneOfBlockData' is assignable to the constraint of type 'Data', but 'Data' could be instantiated with a different subtype of constraint 'BlockDataInterface'.
    return OneOfBlockData as unknown as Type<OneOfBlockDataInterface<BlockMap, Data>>;
}

interface OneOfBlockItemInputInterface extends BlockInput {
    type: string;
    props: BlockInputInterface;
    transformToBlockData(): OneOfBlockItemDataInterface;
}

export function BaseOneOfBlockItemInput<BlockMap extends BaseBlockMap>({
    supportedBlocks,
    OneOfBlockItemData,
}: {
    supportedBlocks: BlockMap;
    OneOfBlockItemData: Type<OneOfBlockItemDataInterface>;
}): Type<OneOfBlockItemInputInterface> {
    class OneOfBlockItemInput extends BlockInput {
        @IsString()
        type: string;

        @Transform(
            ({ value, obj }) => {
                const blockType = obj.type as string;
                const block = supportedBlocks[blockType];

                if (!block) {
                    throw new Error(`unknown type ${blockType}`);
                }

                return isBlockInputInterface(value) ? value : block.blockInputFactory(value);
            },
            { toClassOnly: true },
        )
        @ValidateNested()
        props: BlockInputInterface;

        transformToBlockData(): OneOfBlockItemDataInterface {
            const blockType = this.type;
            const block = supportedBlocks[blockType];

            if (!block) {
                throw new Error(`unknown type ${blockType}`);
            }

            return plainToInstance(OneOfBlockItemData, {
                type: this.type,
                props: this.props.transformToBlockData(),
            });
        }
    }

    return OneOfBlockItemInput;
}

export function BaseOneOfBlockInput<
    BlockMap extends BaseBlockMap,
    Data extends BlockDataInterface = BlockDataInterface,
    Input extends SimpleBlockInputInterface<Data> = SimpleBlockInputInterface<Data>,
>({
    supportedBlocks,
    allowEmpty,
    OneOfBlockData,
    OneOfBlockItemInput,
}: {
    supportedBlocks: BlockMap;
    allowEmpty?: boolean;
    OneOfBlockData: Type<OneOfBlockDataInterface<BlockMap, Data>>;
    OneOfBlockItemInput: Type<OneOfBlockItemInputInterface>;
}): Type<OneOfBlockInputInterface<BlockMap, Data, Input>> {
    for (const block in supportedBlocks) {
        if (!supportedBlocks[block]) {
            throw new Error(`Supported block '${block}' is undefined. This is most likely due to a circular import`);
        }
    }

    const supportedBlockTypes: Array<keyof BlockMap | null> = Object.keys(supportedBlocks);

    class OneOfBlockInput extends BlockInput<Data> {
        @Transform(({ value }: { value: OneOfBlockItemInputInterface[] }) =>
            value
                .filter((item) => {
                    if (!supportedBlocks[item.type]) {
                        console.warn(`Unknown block type "${item.type}"`);
                        return false;
                    }

                    return true;
                })
                .map((item) => plainToInstance(OneOfBlockItemInput, item)),
        )
        @ArrayMinSize(allowEmpty ? 0 : 1)
        @ValidateNested({ each: true })
        attachedBlocks: OneOfBlockInputInterface<BlockMap, Data, Input>["attachedBlocks"];

        @IsOptional()
        @IsIn(supportedBlockTypes)
        @BlockField({ nullable: allowEmpty })
        activeType?: string;

        transformToBlockData(): OneOfBlockDataInterface<BlockMap, Data> {
            const { attachedBlocks, activeType, ...additionalFields } = this;

            return plainToInstance(OneOfBlockData, {
                attachedBlocks: attachedBlocks.map((block) => block.transformToBlockData()),
                activeType: this.activeType && supportedBlocks[this.activeType] ? this.activeType : undefined,
                ...additionalFields,
            });
        }
    }

    // Type cast to suppress error: 'OneOfBlockInput' is assignable to the constraint of type 'Input', but 'Input' could be instantiated with a different subtype of constraint 'SimpleBlockInputInterface<Data>'.
    return OneOfBlockInput as unknown as Type<OneOfBlockInputInterface<BlockMap, Data, Input>>;
}

export type OneOfBlock<
    BlockMap extends BaseBlockMap,
    Data extends BlockDataInterface = BlockDataInterface,
    Input extends SimpleBlockInputInterface<Data> = SimpleBlockInputInterface<Data>,
> = Block<OneOfBlockDataInterface<BlockMap, Data>, OneOfBlockInputInterface<BlockMap, Data, Input>>;

export interface CreateOneOfBlockOptions<
    BlockMap extends BaseBlockMap,
    Data extends BlockDataInterface = BlockDataInterface,
    Input extends SimpleBlockInputInterface<Data> = SimpleBlockInputInterface<Data>,
> {
    supportedBlocks: BlockMap;
    allowEmpty?: boolean;
    OneOfBlockItemData?: Type<OneOfBlockItemDataInterface>;
    OneOfBlockItemInput?: Type<OneOfBlockItemInputInterface>;
    OneOfBlockData?: Type<OneOfBlockDataInterface<BlockMap, Data>>;
    OneOfBlockInput?: Type<OneOfBlockInputInterface<BlockMap, Data, Input>>;
}

export function createOneOfBlock<
    BlockMap extends BaseBlockMap,
    Data extends BlockDataInterface = BlockDataInterface,
    Input extends SimpleBlockInputInterface<Data> = SimpleBlockInputInterface<Data>,
>(
    {
        supportedBlocks,
        allowEmpty = true,
        OneOfBlockItemData = BaseOneOfBlockItemData({ supportedBlocks }),
        OneOfBlockItemInput = BaseOneOfBlockItemInput({ supportedBlocks, OneOfBlockItemData }),
        OneOfBlockData = BaseOneOfBlockData({ supportedBlocks, OneOfBlockItemData }),
        OneOfBlockInput = BaseOneOfBlockInput({ supportedBlocks, allowEmpty, OneOfBlockData, OneOfBlockItemInput }),
    }: CreateOneOfBlockOptions<BlockMap, Data, Input>,
    nameOrOptions: BlockFactoryNameOrOptions,
): OneOfBlock<BlockMap, Data, Input> {
    const attachedBlockObject: BlockMetaInterface = {
        fields: [
            { name: "type", kind: BlockMetaFieldKind.String, nullable: false },
            {
                name: "props",
                kind: BlockMetaFieldKind.OneOfBlocks,
                blocks: supportedBlocks,
                nullable: false,
            },
        ],
    };

    const attachedBlocksField: BlockMetaField = {
        name: "attachedBlocks",
        kind: BlockMetaFieldKind.NestedObjectList,
        object: attachedBlockObject,
        nullable: false,
    };

    class Meta extends AnnotationBlockMeta {
        get fields(): BlockMetaField[] {
            return [
                ...super.fields,
                attachedBlocksField,
                {
                    name: "activeType",
                    kind: BlockMetaFieldKind.String,
                    nullable: true,
                },
                {
                    name: "block",
                    kind: BlockMetaFieldKind.NestedObject,
                    nullable: true,
                    object: attachedBlockObject,
                },
            ];
        }
    }

    class InputMeta extends AnnotationBlockMeta {
        get fields(): BlockMetaField[] {
            return [attachedBlocksField, ...super.fields];
        }
    }

    let name: string;
    let migrate: MigrateOptions | undefined;

    if (typeof nameOrOptions === "string") {
        name = nameOrOptions;
    } else {
        name = nameOrOptions.name;
        migrate = nameOrOptions.migrate;
    }

    return createBlock(OneOfBlockData, OneOfBlockInput, {
        name,
        blockMeta: new Meta(OneOfBlockData),
        blockInputMeta: new InputMeta(OneOfBlockInput),
        migrate,
    });
}
