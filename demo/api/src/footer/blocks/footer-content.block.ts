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
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block.js";
import { IsString } from "class-validator";

class FooterContentBlockData extends BlockData {
    @ChildBlock(TipTapRichTextBlock)
    text: ExtractBlockInput<typeof TipTapRichTextBlock>;

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
    @ChildBlockInput(TipTapRichTextBlock)
    text: ExtractBlockInput<typeof TipTapRichTextBlock>;

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
