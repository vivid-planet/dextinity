import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { StandaloneMediaBlockData } from "@src/blocks.generated";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { mediaAspectRatioOptions } from "@src/util/mediaAspectRatios";
import { FormattedMessage } from "react-intl";

export const StandaloneMediaBlock = createCompositeBlock(
    {
        name: "Media",
        displayName: MediaBlock.displayName,
        blocks: {
            media: {
                block: MediaBlock,
            },
            aspectRatio: {
                block: createCompositeBlockSelectField<StandaloneMediaBlockData["aspectRatio"]>({
                    label: <FormattedMessage id="standaloneMedia.aspectRatio" defaultMessage="Aspect Ratio" />,
                    defaultValue: "16x9",
                    options: mediaAspectRatioOptions,
                }),
            },
        },
    },
    (block) => {
        block.category = BlockCategory.Media;
        return block;
    },
);
