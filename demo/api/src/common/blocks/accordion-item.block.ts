import {
    BlockData,
    type BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    createBlocksBlock,
    type ExtractBlockInput,
    IsUndefinable,
} from "@dextinity/cms-api";
import { RichTextBlock } from "@src/common/blocks/rich-text.block.js";
import { SpaceBlock } from "@src/common/blocks/space.block.js";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/standalone-call-to-action-list.block.js";
import { StandaloneHeadingBlock } from "@src/common/blocks/standalone-heading.block.js";
import { IsBoolean, IsEnum, IsString } from "class-validator";

import { TextImageBlock } from "./text-image.block.js";

export const AccordionContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            richtext: RichTextBlock,
            heading: StandaloneHeadingBlock,
            space: SpaceBlock,
            callToActionList: StandaloneCallToActionListBlock,
            textImage: TextImageBlock,
        },
    },
    "AccordionContent",
);

export enum AccordionItemTitleHtmlTag {
    h1 = "h1",
    h2 = "h2",
    h3 = "h3",
    h4 = "h4",
    h5 = "h5",
    h6 = "h6",
}

class AccordionItemBlockData extends BlockData {
    @BlockField({ nullable: true })
    title?: string;

    @ChildBlock(AccordionContentBlock)
    content: BlockDataInterface;

    @BlockField()
    openByDefault: boolean;

    @BlockField({ type: "enum", enum: AccordionItemTitleHtmlTag })
    titleHtmlTag: AccordionItemTitleHtmlTag;
}

class AccordionItemBlockInput extends BlockInput {
    @IsUndefinable()
    @BlockField({ nullable: true })
    @IsString()
    title?: string;

    @ChildBlockInput(AccordionContentBlock)
    content: ExtractBlockInput<typeof AccordionContentBlock>;

    @IsBoolean()
    @BlockField()
    openByDefault: boolean;

    @IsEnum(AccordionItemTitleHtmlTag)
    @BlockField({ type: "enum", enum: AccordionItemTitleHtmlTag })
    titleHtmlTag: AccordionItemTitleHtmlTag;

    transformToBlockData(): AccordionItemBlockData {
        return blockInputToData(AccordionItemBlockData, this);
    }
}

export const AccordionItemBlock = createBlock(AccordionItemBlockData, AccordionItemBlockInput, "AccordionItem");
