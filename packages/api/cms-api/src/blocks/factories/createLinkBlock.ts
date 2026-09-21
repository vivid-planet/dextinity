import { IsOptional, IsString } from "class-validator";

import { Block, BlockDataInterface, BlockInputInterface } from "../block";
import { BlockField } from "../decorators/field";
import { BlockFactoryNameOrOptions } from ".//types";
import {
    BaseOneOfBlockData,
    BaseOneOfBlockInput,
    BaseOneOfBlockItemData,
    BaseOneOfBlockItemInput,
    createOneOfBlock,
    CreateOneOfBlockOptions,
} from "./createOneOfBlock";
import { withDefaultDescription } from "./withDefaultDescription";

function createLinkBlock<BlockMap extends Record<string, Block<BlockDataInterface, BlockInputInterface>>>(
    { supportedBlocks, allowEmpty = false }: CreateOneOfBlockOptions<BlockMap>,
    nameOrOptions: BlockFactoryNameOrOptions = "Link",
) {
    class LinkBlockItemData extends BaseOneOfBlockItemData({ supportedBlocks }) {}

    class LinkBlockItemInput extends BaseOneOfBlockItemInput({ supportedBlocks, OneOfBlockItemData: LinkBlockItemData }) {}

    class LinkBlockData extends BaseOneOfBlockData({ supportedBlocks, OneOfBlockItemData: LinkBlockItemData }) {
        @BlockField({ nullable: true })
        title?: string;
    }

    class LinkBlockInput extends BaseOneOfBlockInput({
        supportedBlocks,
        allowEmpty,
        OneOfBlockData: LinkBlockData,
        OneOfBlockItemInput: LinkBlockItemInput,
    }) {
        @BlockField({ nullable: true })
        @IsOptional()
        @IsString()
        title?: string;
    }

    return createOneOfBlock(
        { supportedBlocks, allowEmpty, OneOfBlockData: LinkBlockData, OneOfBlockInput: LinkBlockInput },
        withDefaultDescription(
            nameOrOptions,
            "A link whose target is one of the supported link blocks, for instance a page of the page tree or an external URL.",
        ),
    );
}

export { createLinkBlock };
