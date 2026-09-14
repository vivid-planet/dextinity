import { AnchorBlock, BlockCategory, createBlocksBlock, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { ContentGroupBlockData } from "@src/blocks.generated";
import { AccordionBlock } from "@src/common/blocks/AccordionBlock";
import { MediaGalleryBlock } from "@src/common/blocks/MediaGalleryBlock";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/StandaloneCallToActionListBlock";
import { StandaloneHeadingBlock } from "@src/common/blocks/StandaloneHeadingBlock";
import { StandaloneMediaBlock } from "@src/common/blocks/StandaloneMediaBlock";
import { StandaloneRichTextBlock } from "@src/common/blocks/StandaloneRichTextBlock";
import { TableBlock } from "@src/common/blocks/TableBlock";
import { TipTapTableBlock } from "@src/common/blocks/TipTapTableBlock";
import { ColumnsBlock } from "@src/documents/pages/blocks/ColumnsBlock";
import { KeyFactsBlock } from "@src/documents/pages/blocks/KeyFactsBlock";
import { TeaserBlock } from "@src/documents/pages/blocks/TeaserBlock";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

const backgroundColorOptions: Array<{ value: ContentGroupBlockData["backgroundColor"]; label: ReactNode }> = [
    { value: "default", label: <FormattedMessage id="contentGroupBlock.backgroundColor.default" defaultMessage="Default" /> },
    { value: "lightGray", label: <FormattedMessage id="contentGroupBlock.backgroundColor.lightGray" defaultMessage="Light Gray" /> },
    { value: "darkGray", label: <FormattedMessage id="contentGroupBlock.backgroundColor.darkGray" defaultMessage="Dark Gray" /> },
];

const ContentGroupContentBlock = createBlocksBlock({
    name: "ContentGroupContent",
    supportedBlocks: {
        accordion: AccordionBlock,
        anchor: AnchorBlock,
        space: SpaceBlock,
        teaser: TeaserBlock,
        richtext: StandaloneRichTextBlock,
        heading: StandaloneHeadingBlock,
        columns: ColumnsBlock,
        callToActionList: StandaloneCallToActionListBlock,
        keyFacts: KeyFactsBlock,
        media: StandaloneMediaBlock,
        mediaGallery: MediaGalleryBlock,
        table: TableBlock,
        tipTapTable: TipTapTableBlock,
    },
});

export const ContentGroupBlock = createCompositeBlock(
    {
        name: "ContentGroup",
        displayName: <FormattedMessage id="contentGroupBlock.displayName" defaultMessage="Content Group" />,
        blocks: {
            backgroundColor: {
                block: createCompositeBlockSelectField<ContentGroupBlockData["backgroundColor"]>({
                    label: <FormattedMessage id="contentGroupBlock.overlay" defaultMessage="Background Color" />,
                    defaultValue: "default",
                    options: backgroundColorOptions,
                }),
                hiddenInSubroute: true,
            },
            content: {
                block: ContentGroupContentBlock,
                title: <FormattedMessage id="contentGroupBlock.content" defaultMessage="Content" />,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.Layout;
        return block;
    },
);
