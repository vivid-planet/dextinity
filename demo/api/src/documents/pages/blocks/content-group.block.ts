import {
    AnchorBlock,
    BlockData,
    BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    createBlocksBlock,
    ExtractBlockInput,
} from "@dextinity/cms-api";
import { AccordionBlock } from "@src/common/blocks/accordion.block";
import { MediaGalleryBlock } from "@src/common/blocks/media-gallery.block";
import { SpaceBlock } from "@src/common/blocks/space.block";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/standalone-call-to-action-list.block";
import { StandaloneHeadingBlock } from "@src/common/blocks/standalone-heading.block";
import { StandaloneMediaBlock } from "@src/common/blocks/standalone-media.block";
import { StandaloneRichTextBlock } from "@src/common/blocks/standalone-rich-text.block";
import { TableBlock } from "@src/common/blocks/table.block";
import { TipTapTableBlock } from "@src/common/blocks/tip-tap-table.block";
import { ColumnsBlock } from "@src/documents/pages/blocks/columns.block";
import { KeyFactsBlock } from "@src/documents/pages/blocks/key-facts.block";
import { TeaserBlock } from "@src/documents/pages/blocks/teaser.block";
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
