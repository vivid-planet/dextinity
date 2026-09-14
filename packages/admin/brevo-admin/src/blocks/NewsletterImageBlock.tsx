import { BlockCategory, type BlockInterface, type BlockState, createCompositeBlock, PixelImageBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import type { NewsletterImageBlockData, NewsletterImageBlockInput } from "../blocks.generated";

type NewsletterImageBlockState = { image: BlockState<typeof PixelImageBlock> };

export const NewsletterImageBlock: BlockInterface<NewsletterImageBlockData, NewsletterImageBlockState, NewsletterImageBlockInput> =
    createCompositeBlock({
        name: "NewsletterImage",
        displayName: <FormattedMessage id="dextinity.blocks.newsletterImage.displayName" defaultMessage="Newsletter Image" />,
        category: BlockCategory.Media,
        blocks: {
            image: {
                block: PixelImageBlock,
                title: <FormattedMessage id="dextinity.blocks.newsletterImage.image" defaultMessage="Image" />,
            },
        },
    });
