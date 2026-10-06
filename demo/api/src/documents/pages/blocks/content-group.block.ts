import {
    AnchorBlock,
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
} from "@dextinity/cms-api";
import { AccordionBlock } from "@src/common/blocks/accordion.block.js";
import { MediaGalleryBlock } from "@src/common/blocks/media-gallery.block.js";
import { SpaceBlock } from "@src/common/blocks/space.block.js";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/standalone-call-to-action-list.block.js";
import { StandaloneHeadingBlock } from "@src/common/blocks/standalone-heading.block.js";
import { StandaloneMediaBlock } from "@src/common/blocks/standalone-media.block.js";
import { StandaloneRichTextBlock } from "@src/common/blocks/standalone-rich-text.block.js";
import { TableBlock } from "@src/common/blocks/table.block.js";
import { TipTapTableBlock } from "@src/common/blocks/tip-tap-table.block.js";
import { ColumnsBlock } from "@src/documents/pages/blocks/columns.block.js";
import { KeyFactsBlock } from "@src/documents/pages/blocks/key-facts.block.js";
import { TeaserBlock } from "@src/documents/pages/blocks/teaser.block.js";
import { IsEnum } from "class-validator";

export const ContentBlock = createBlocksBlock(
    {
        supportedBlocks: {
            accordion: AccordionBlock,
            anchor: AnchorBlock,
            callToActionList: StandaloneCallToActionListBlock,
            columns: ColumnsBlock,
            heading: StandaloneHeadingBlock,
            keyFacts: KeyFactsBlock,
            media: StandaloneMediaBlock,
            mediaGallery: MediaGalleryBlock,
            richtext: StandaloneRichTextBlock,
            space: SpaceBlock,
            teaser: TeaserBlock,
            table: TableBlock,
            tipTapTable: TipTapTableBlock,
        },
    },
    { name: "ContentGroupContent" },
);

export enum BackgroundColor {
    default = "default",
    lightGray = "lightGray",
    darkGray = "darkGray",
}

class ContentGroupBlockData extends BlockData {
    @ChildBlock(ContentBlock)
    content: BlockDataInterface;

    @BlockField({ type: "enum", enum: BackgroundColor })
    backgroundColor: BackgroundColor;
}

class ContentGroupBlockInput extends BlockInput {
    @ChildBlockInput(ContentBlock)
    content: ExtractBlockInput<typeof ContentBlock>;

    @IsEnum(BackgroundColor)
    @BlockField({ type: "enum", enum: BackgroundColor })
    backgroundColor: BackgroundColor;

    transformToBlockData(): ContentGroupBlockData {
        return blockInputToData(ContentGroupBlockData, this);
    }
}

export const ContentGroupBlock = createBlock(ContentGroupBlockData, ContentGroupBlockInput, "ContentGroup");
