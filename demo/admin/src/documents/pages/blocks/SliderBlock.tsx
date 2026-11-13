import { BlockCategory, createCompositeBlock, createListBlock } from "@dextinity/cms-admin";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { FormattedMessage } from "react-intl";

const SliderItemBlock = createCompositeBlock({
    name: "SliderItem",
    displayName: <FormattedMessage id="sliderItemBlock.displayName" defaultMessage="Slider Item" />,
    category: BlockCategory.Teaser,
    blocks: {
        media: {
            block: MediaBlock,
            title: <FormattedMessage id="sliderItemBlock.media" defaultMessage="Media" />,
            hiddenInSubroute: true,
        },
        text: {
            block: RichTextBlock,
            hiddenInSubroute: true,
        },
    },
});

export const SliderBlock = createListBlock({
    name: "Slider",
    displayName: <FormattedMessage id="sliderBlock.displayName" defaultMessage="Slider" />,
    iconName: "swap",
    description: <FormattedMessage id="sliderBlock.description" defaultMessage="Slides with media and text" />,
    block: SliderItemBlock,
    itemName: <FormattedMessage id="sliderBlock.itemName" defaultMessage="Item" />,
    itemsName: <FormattedMessage id="sliderBlock.itemsName" defaultMessage="Items" />,
});
