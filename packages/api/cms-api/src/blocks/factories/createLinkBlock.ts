import { IsString } from "class-validator";

import { IsNullable } from "../../common/validators/is-nullable.js";
import type { Block, BlockDataInterface, BlockInputInterface } from "../block.js";
import { BlockField } from "../decorators/field.js";
import {
    BaseOneOfBlockData,
    BaseOneOfBlockInput,
    BaseOneOfBlockItemData,
    BaseOneOfBlockItemInput,
    createOneOfBlock,
    createOneOfBlockDescription,
    type CreateOneOfBlockOptions,
} from "./createOneOfBlock.js";
import type { BlockFactoryNameOrOptions } from "./types.js";
import { withDefaultDescription } from "./withDefaultDescription.js";

function createLinkBlock<BlockMap extends Record<string, Block<BlockDataInterface, BlockInputInterface>>>(
    { supportedBlocks, allowEmpty = false }: CreateOneOfBlockOptions<BlockMap>,
    nameOrOptions: BlockFactoryNameOrOptions = "Link",
) {
    class LinkBlockItemData extends BaseOneOfBlockItemData({ supportedBlocks }) {}

    class LinkBlockItemInput extends BaseOneOfBlockItemInput({ supportedBlocks, OneOfBlockItemData: LinkBlockItemData }) {}

    class LinkBlockData extends BaseOneOfBlockData({ supportedBlocks, OneOfBlockItemData: LinkBlockItemData }) {
        @BlockField({ type: "string", nullable: true })
        title: string | null;
    }

    class LinkBlockInput extends BaseOneOfBlockInput({
        supportedBlocks,
        allowEmpty,
        OneOfBlockData: LinkBlockData,
        OneOfBlockItemInput: LinkBlockItemInput,
    }) {
        @BlockField({ type: "string", nullable: true })
        @IsNullable()
        @IsString()
        title: string | null;
    }

    return createOneOfBlock(
        { supportedBlocks, allowEmpty, OneOfBlockData: LinkBlockData, OneOfBlockInput: LinkBlockInput },
        withDefaultDescription(nameOrOptions, `A link to one of several targets. ${createOneOfBlockDescription({ allowEmpty })}`),
    );
}

export { createLinkBlock };
