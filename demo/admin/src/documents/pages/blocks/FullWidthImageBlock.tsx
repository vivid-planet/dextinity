import { messages } from "@dextinity/admin";
import { createCompositeBlock, createOptionalBlock, DamImageBlock } from "@dextinity/cms-admin";
import { customBlockCategory } from "@src/common/blocks/customBlockCategories";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { FormattedMessage } from "react-intl";

const FullWidthImageContentBlock = createOptionalBlock(RichTextBlock, {
    title: <FormattedMessage {...messages.content} />,
});

export const FullWidthImageBlock = createCompositeBlock(
    {
        name: "FullWidthImage",
        displayName: <FormattedMessage id="blocks.fullWidthImage" defaultMessage="Full Width Image" />,
        blocks: {
            image: {
                block: DamImageBlock,
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
