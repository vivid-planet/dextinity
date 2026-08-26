import {
    BlockCategory,
    type BlockInterface,
    createOneOfBlock,
    DamImageBlock,
    DamVideoBlock,
    VimeoVideoBlock,
    YouTubeVideoBlock,
} from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const MediaBlock: BlockInterface = createOneOfBlock({
    supportedBlocks: { image: DamImageBlock, damVideo: DamVideoBlock, youTubeVideo: YouTubeVideoBlock, vimeoVideo: VimeoVideoBlock },
    name: "Media",
    displayName: <FormattedMessage id="mediaBlock.displayName" defaultMessage="Media" />,
    allowEmpty: false,
    variant: "toggle",
    category: BlockCategory.Media,
});
