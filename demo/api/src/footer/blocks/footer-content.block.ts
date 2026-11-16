import {
    BlockData,
    type BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    DamImageBlock,
    type ExtractBlockInput,
} from "@dextinity/cms-api";
import { LinkListBlock } from "@src/common/blocks/link-list.block.js";
import { RichTextBlock } from "@src/common/blocks/rich-text.block.js";
import { IsString } from "class-validator";

class FooterContentBlockData extends BlockData {
    @ChildBlock(RichTextBlock)
    text: ExtractBlockInput<typeof RichTextBlock>;

    @ChildBlock(DamImageBlock)
    image: BlockDataInterface;

    @BlockField()
    caption: string;

    @ChildBlock(LinkListBlock)
    linkList: BlockDataInterface;

    @BlockField()
    copyrightNotice: string;
}

class FooterContentBlockInput extends BlockInput {
    @ChildBlockInput(RichTextBlock)
    text: ExtractBlockInput<typeof RichTextBlock>;

    @ChildBlockInput(DamImageBlock)
    image: ExtractBlockInput<typeof DamImageBlock>;

    @BlockField()
    @IsString()
    caption: string;

    @ChildBlockInput(LinkListBlock)
    linkList: ExtractBlockInput<typeof LinkListBlock>;

    @BlockField()
    @IsString()
    copyrightNotice: string;

    transformToBlockData(): FooterContentBlockData {
        return blockInputToData(FooterContentBlockData, this);
    }
}

export const FooterContentBlock = createBlock(FooterContentBlockData, FooterContentBlockInput, {
    name: "FooterContent",
});
