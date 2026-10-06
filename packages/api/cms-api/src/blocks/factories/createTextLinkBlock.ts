import { IsOptional, IsString } from "class-validator";

import {
    type Block,
    BlockData,
    type BlockDataInterface,
    BlockInput,
    type BlockInputInterface,
    blockInputToData,
    createBlock,
    type ExtractBlockInput,
    type SimpleBlockInputInterface,
} from "../block.js";
import { ChildBlock } from "../decorators/child-block.js";
import { ChildBlockInput } from "../decorators/child-block-input.js";
import { BlockField } from "../decorators/field.js";
import type { SearchText } from "../search/get-search-text.js";
import type { BlockFactoryNameOrOptions } from "./types.js";

interface CreateTextLinkBlockOptions<LinkBlock extends Block> {
    link: LinkBlock;
}

interface TextImageBlockInputInterface<LinkBlockInput extends BlockInputInterface> extends SimpleBlockInputInterface {
    text?: string;
    link: LinkBlockInput;
}

export function createTextLinkBlock<LinkBlock extends Block>(
    { link: LinkBlock }: CreateTextLinkBlockOptions<LinkBlock>,
    name: BlockFactoryNameOrOptions = "TextLink",
): Block<BlockDataInterface, TextImageBlockInputInterface<ExtractBlockInput<LinkBlock>>> {
    class TextLinkBlockData extends BlockData {
        @BlockField()
        text?: string;

        @ChildBlock(LinkBlock)
        link: BlockDataInterface;

        searchText(): SearchText[] {
            return this.text ? [this.text] : [];
        }
    }

    class TextLinkBlockInput extends BlockInput {
        @IsOptional()
        @IsString()
        @BlockField()
        text?: string;

        @ChildBlockInput(LinkBlock)
        link: ExtractBlockInput<LinkBlock>;

        transformToBlockData(): TextLinkBlockData {
            return blockInputToData(TextLinkBlockData, this);
        }
    }

    return createBlock(TextLinkBlockData, TextLinkBlockInput, name);
}
