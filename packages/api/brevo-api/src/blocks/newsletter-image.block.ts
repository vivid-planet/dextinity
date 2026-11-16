import {
    BlockData,
    type BlockDataInterface,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    type ExtractBlockInput,
    PixelImageBlock,
} from "@dextinity/cms-api";

class NewsletterImageBlockData extends BlockData {
    @ChildBlock(PixelImageBlock)
    image: BlockDataInterface;
}
class NewsletterImageBlockInput extends BlockInput {
    @ChildBlockInput(PixelImageBlock)
    image: ExtractBlockInput<typeof PixelImageBlock>;

    transformToBlockData(): NewsletterImageBlockData {
        return blockInputToData(NewsletterImageBlockData, this);
    }
}
export const NewsletterImageBlock = createBlock(NewsletterImageBlockData, NewsletterImageBlockInput, {
    name: "NewsletterImage",
});
