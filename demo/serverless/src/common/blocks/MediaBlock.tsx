import { BlockCategory, type BlockInterface, createOneOfBlock } from "@dextinity/cms-admin";
import { createVimeoVideoBlock, createYouTubeVideoBlock, DamImageBlock, DamVideoBlock, PixelImageBlock } from "@dextinity/serverless/client";
import { FormattedMessage } from "react-intl";

export const MediaBlock: BlockInterface = createOneOfBlock({
    supportedBlocks: {
        image: DamImageBlock,
        damVideo: DamVideoBlock,
        youTubeVideo: createYouTubeVideoBlock({ previewImage: PixelImageBlock }),
        vimeoVideo: createVimeoVideoBlock({ previewImage: PixelImageBlock }),
    },
    name: "Media",
    displayName: <FormattedMessage id="mediaBlock.displayName" defaultMessage="Media" />,
    allowEmpty: false,
    variant: "toggle",
    category: BlockCategory.Media,
});
