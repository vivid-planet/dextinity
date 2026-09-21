import { createOneOfBlock, DamImageBlock, DamVideoBlock, VimeoVideoBlock, YouTubeVideoBlock } from "@dextinity/cms-api";

export const MediaBlock = createOneOfBlock(
    {
        supportedBlocks: {
            image: DamImageBlock,
            damVideo: DamVideoBlock,
            youTubeVideo: YouTubeVideoBlock,
            vimeoVideo: VimeoVideoBlock,
        },
    },
    { name: "Media", description: "An image or a video, either from the Digital Asset Management or from YouTube or Vimeo." },
);
