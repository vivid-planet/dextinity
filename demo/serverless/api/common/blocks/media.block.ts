import {
    createOneOfBlock,
    createVimeoVideoBlock,
    createYouTubeVideoBlock,
    DamImageBlock,
    DamVideoBlock,
    PixelImageBlock,
} from "@dextinity/serverless/server";

export const MediaBlock = createOneOfBlock({
    name: "Media",
    supportedBlocks: {
        image: DamImageBlock,
        damVideo: DamVideoBlock,
        youTubeVideo: createYouTubeVideoBlock({ previewImage: PixelImageBlock }),
        vimeoVideo: createVimeoVideoBlock({ previewImage: PixelImageBlock }),
    },
    allowEmpty: false,
});
