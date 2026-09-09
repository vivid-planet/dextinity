import { instanceToPlain, plainToInstance } from "class-transformer";
import { registerDecorator, validate, ValidationArguments, ValidationOptions } from "class-validator";
import type { DraftBlockType, DraftEntityMutability, DraftInlineStyleType, RawDraftContentState, RawDraftEntityRange } from "draft-js";

import {
    Block,
    BlockData,
    BlockDataFactory,
    BlockDataInterface,
    BlockInputFactory,
    BlockInputInterface,
    ChildBlockInfo,
    ExtractBlockInput,
    registerBlock,
} from "../block";
import { AnnotationBlockMeta, BlockField } from "../decorators/field";
import { strictBlockDataFactoryDecorator } from "../helpers/strictBlockDataFactoryDecorator";
import { strictBlockInputFactoryDecorator } from "../helpers/strictBlockInputFactoryDecorator";
import { createAppliedMigrationsBlockDataFactoryDecorator } from "../migrations/createAppliedMigrationsBlockDataFactoryDecorator";
import { BlockDataMigrationVersion } from "../migrations/decorators/BlockDataMigrationVersion";
import { SearchText } from "../search/get-search-text";
import { BlockFactoryNameOrOptions } from "./types";

interface CreateRichTextBlockOptions {
    link: Block;
    indexSearchText?: boolean;
}

// Replaces draft-js' RawDraftContentBlock
interface RawDraftInlineStyleRange {
    style: DraftInlineStyleType | "SUP" | "SUB"; // add our custom RTE styles
    offset: number;
    length: number;
}
// Copied from draft-js types, only RawDraftInlineStyleRange is replaced
interface RawDraftContentBlock {
    key: string;
    type: DraftBlockType;
    text: string;
    depth: number;
    inlineStyleRanges: Array<RawDraftInlineStyleRange>;
    entityRanges: Array<RawDraftEntityRange>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: { [key: string]: any };
}

// Replaces draft-js' RawDraftContentState
interface DraftJsFactoryProps<LinkBlockInput extends BlockInputInterface> {
    blocks: Array<RawDraftContentBlock>;
    entityMap: {
        [key: string]: { type: "LINK"; mutability: DraftEntityMutability; data: ReturnType<LinkBlockInput["toPlain"]> }; // extend this once more draftJS entities are supported
    };
}

interface DraftJsInput<LinkBlockInput extends BlockInputInterface> {
    blocks: Array<RawDraftContentBlock>;
    entityMap: {
        [key: string]: { type: "LINK"; mutability: DraftEntityMutability; data: LinkBlockInput }; // extend this once more draftJS entities are supported
    };
}

interface RichTextBlockDataInterface extends BlockDataInterface {
    draftContent: RawDraftContentState;
}

interface RichTextBlockInputInterface<LinkBlockInput extends BlockInputInterface>
    extends BlockInputInterface<BlockDataInterface, { draftContent: DraftJsFactoryProps<LinkBlockInput> }> {
    draftContent: DraftJsInput<LinkBlockInput>;
}

export function createRichTextBlock<LinkBlock extends Block>(
    { link: LinkBlock, indexSearchText = true }: CreateRichTextBlockOptions,
    nameOrOptions: BlockFactoryNameOrOptions = "RichText",
): Block<RichTextBlockDataInterface, RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>> {
    if (!LinkBlock) {
        throw new Error("Provided 'link' is undefined. This is most likely due to a circular import");
    }

    const blockName = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;
    const migrate = typeof nameOrOptions !== "string" && nameOrOptions.migrate ? nameOrOptions.migrate : { migrations: [], version: 0 };

    @BlockDataMigrationVersion(migrate.version)
    class RichTextBlockData extends BlockData {
        @BlockField({ type: "json" })
        draftContent: RawDraftContentState;

        searchText(): SearchText[] {
            if (!indexSearchText) {
                return [];
            }

            return this.draftContent.blocks.map((block) => {
                switch (block.type) {
                    case "header-one":
                        return { weight: "h1", text: block.text };
                    case "header-two":
                        return { weight: "h2", text: block.text };
                    case "header-three":
                        return { weight: "h3", text: block.text };
                    case "header-four":
                        return { weight: "h4", text: block.text };
                    case "header-five":
                        return { weight: "h5", text: block.text };
                    case "header-six":
                        return { weight: "h6", text: block.text };
                    default:
                        return block.text;
                }
            });
        }

        childBlocksInfo(): ChildBlockInfo[] {
            const ret: ChildBlockInfo[] = [];
            Object.entries(this.draftContent.entityMap).map(([key, entity]) => {
                if (entity.type === "LINK") {
                    ret.push({
                        visible: true,
                        relJsonPath: ["draftContent", "entityMap", key, "data"],
                        block: entity.data as BlockDataInterface,
                        name: LinkBlock.name,
                    });
                }
            });
            return ret;
        }
    }

    class RichTextBlockInput implements RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>> {
        @IsDraftContent(LinkBlock)
        @BlockField({ type: "json" })
        draftContent: DraftJsInput<ExtractBlockInput<LinkBlock>>;

        transformToBlockData(): RichTextBlockData {
            return plainToInstance(RichTextBlockData, {
                ...this,
                draftContent: {
                    ...this.draftContent,
                    entityMap: Object.fromEntries(
                        Object.entries(this.draftContent.entityMap).map(([key, entity]) => {
                            if (entity.type === "LINK") {
                                return [
                                    key,
                                    {
                                        ...entity,
                                        // we need plainToInstance here as data is not typed by class-transformer
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        data: LinkBlock.blockInputFactory(entity.data as any).transformToBlockData(),
                                    },
                                ];
                            } else {
                                return [key, entity];
                            }
                        }),
                    ),
                },
            });
        }
        toPlain(): ReturnType<RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>["toPlain"]> {
            return instanceToPlain(this) as ReturnType<RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>["toPlain"]>;
        }
    }

    const blockDataFactory: BlockDataFactory<RichTextBlockData> = ({ draftContent }: { draftContent: RawDraftContentState }) => {
        const entityMap = Object.fromEntries(
            Object.entries(draftContent.entityMap).map(([key, entity]) => {
                if (entity.type === "LINK") {
                    return [
                        key,
                        {
                            ...entity,
                            // we need plainToInstance here as data is not typed by class-transformer
                            data: LinkBlock.blockDataFactory(entity.data),
                        },
                    ];
                } else {
                    return [key, entity];
                }
            }),
        );

        return plainToInstance(RichTextBlockData, {
            draftContent: {
                ...draftContent,
                entityMap,
            },
        });
    };
    const blockInputFactory: BlockInputFactory<RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>> = (o) =>
        plainToInstance(RichTextBlockInput, o);

    // Decorate BlockDataFactory
    let decorateBlockDataFactory = blockDataFactory;
    if (migrate.migrations) {
        const blockDataFactoryDecorator1 = createAppliedMigrationsBlockDataFactoryDecorator(migrate.migrations, blockName);
        decorateBlockDataFactory = blockDataFactoryDecorator1(decorateBlockDataFactory);
    }
    decorateBlockDataFactory = strictBlockDataFactoryDecorator(decorateBlockDataFactory);

    // Decorate BlockInputFactory
    const decorateBlockInputFactory = strictBlockInputFactoryDecorator(blockInputFactory);

    const RichTextBlock: Block<RichTextBlockData, RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>> = {
        name: blockName,
        blockDataFactory: decorateBlockDataFactory,
        blockInputFactory: decorateBlockInputFactory,
        blockMeta: new AnnotationBlockMeta(RichTextBlockData),
        blockInputMeta: new AnnotationBlockMeta(RichTextBlockInput),
        referencedBlocks: [LinkBlock],
    };

    registerBlock(RichTextBlock);

    return RichTextBlock;
}

function IsDraftContent(link: Block, validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isDraftContent",
            target: object.constructor,
            propertyName,
            constraints: [link],
            options: validationOptions,
            validator: {
                async validate(value: unknown, args: ValidationArguments) {
                    const LinkBlock = args.constraints[0] as Block;

                    if (isDraftJsInput(value)) {
                        for (const entity of Object.values(value.entityMap)) {
                            const validationErrors = await validate(LinkBlock.blockInputFactory(entity.data), {
                                forbidNonWhitelisted: true,
                                whitelist: true,
                            });

                            if (validationErrors.length > 0) {
                                return false;
                            }
                        }

                        return true;
                    }

                    return false;
                },
            },
        });
    };
}

function isDraftJsInput(value: unknown): value is DraftJsInput<BlockInputInterface> {
    return (
        typeof value === "object" &&
        value !== null &&
        "blocks" in value &&
        "entityMap" in value &&
        Array.isArray(value.blocks) &&
        typeof value.entityMap === "object" &&
        value.entityMap !== null &&
        Object.values(value.entityMap).every((entity) => typeof entity === "object" && entity !== null && entity.type === "LINK")
    );
}
