import { BlockCategory, createCompositeBlock, createCompositeBlockTextField } from "@dextinity/cms-admin";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { FormattedMessage } from "react-intl";

export const MediaGalleryItemBlock = createCompositeBlock(
    {
        name: "MediaGalleryItem",
        displayName: <FormattedMessage id="mediaGalleryBlock.mediaGalleryItem.displayName" defaultMessage="Media Gallery Item" />,
        blocks: {
            media: {
                block: MediaBlock,
                title: <FormattedMessage id="mediaGalleryBlock.mediaGalleryItem.media" defaultMessage="Media" />,
            },
            caption: {
                block: createCompositeBlockTextField({
                    label: <FormattedMessage id="mediaGalleryBlock.mediaGalleryItem.caption" defaultMessage="Caption" />,
                }),
                hiddenInSubroute: true,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.Media;
        return block;
    },
);
