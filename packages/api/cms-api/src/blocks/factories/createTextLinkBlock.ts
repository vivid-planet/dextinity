import { IsOptional, IsString } from "class-validator";

import {
    Block,
    BlockData,
    BlockDataInterface,
    BlockInput,
    BlockInputInterface,
    blockInputToData,
    createBlock,
    ExtractBlockInput,
    SimpleBlockInputInterface,
} from "../block";
import { ChildBlock } from "../decorators/child-block";
import { ChildBlockInput } from "../decorators/child-block-input";
import { BlockField } from "../decorators/field";
import { SearchText } from "../search/get-search-text";
import { BlockFactoryNameOrOptions } from "./types";
import { withDefaultDescription } from "./withDefaultDescription";

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

    return createBlock(TextLinkBlockData, TextLinkBlockInput, withDefaultDescription(name, "A link together with the text that is shown for it."));
}
