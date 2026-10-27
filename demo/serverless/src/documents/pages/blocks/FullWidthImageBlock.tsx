import { messages } from "@dextinity/admin";
import { createCompositeBlock, createOptionalBlock } from "@dextinity/cms-admin";
import { DamImageBlock } from "@dextinity/serverless/client";
import { FormattedMessage } from "react-intl";

import { customBlockCategory } from "../../../common/blocks/customBlockCategories";
import { RichTextBlock } from "../../../common/blocks/RichTextBlock";

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
