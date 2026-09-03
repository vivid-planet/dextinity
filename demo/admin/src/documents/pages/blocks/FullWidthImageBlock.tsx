import { messages } from "@dextinity/admin";
import { createCompositeBlock, createDamImageBlock, createOptionalBlock } from "@dextinity/cms-admin";
import { customBlockCategory } from "@src/common/blocks/customBlockCategories";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { FormattedMessage } from "react-intl";

const FullWidthImageContentBlock = createOptionalBlock(RichTextBlock, {
    title: <FormattedMessage {...messages.content} />,
});

// The site always renders this block's image at `16x9`, so lock the crop area to that aspect ratio.
const FullWidthDamImageBlock = createDamImageBlock({ aspectRatio: "16x9" });

export const FullWidthImageBlock = createCompositeBlock(
    {
        name: "FullWidthImage",
        displayName: <FormattedMessage id="blocks.fullWidthImage" defaultMessage="Full Width Image" />,
        blocks: {
            image: {
                block: FullWidthDamImageBlock,
                title: <FormattedMessage {...messages.image} />,
                paper: true,
            },
            content: {
                block: FullWidthImageContentBlock,
                title: <FormattedMessage {...messages.content} />,
            },
        },
    },
    (block) => {
        block.category = customBlockCategory;
        return block;
    },
);
