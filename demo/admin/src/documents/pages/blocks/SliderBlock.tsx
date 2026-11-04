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

const SliderListBlock = createListBlock({
    name: "SliderList",
    block: SliderItemBlock,
    itemName: <FormattedMessage id="sliderListBlock.itemName" defaultMessage="Item" />,
    itemsName: <FormattedMessage id="sliderListBlock.itemsName" defaultMessage="Items" />,
});

export const SliderBlock = createCompositeBlock({
    name: "Slider",
    displayName: <FormattedMessage id="sliderBlock.displayName" defaultMessage="Slider" />,
    category: BlockCategory.Layout,
    blocks: {
        sliderList: {
            title: <FormattedMessage id="sliderBlock.sliderListBlock.title" defaultMessage="Slider List" />,
            block: SliderListBlock,
        },
    },
});
