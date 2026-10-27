import { PixelImageBlock } from "../../dam/blocks/pixel-image.block";
import {
    Block,
    BlockData,
    BlockDataInterface,
    BlockInput,
    BlockInputInterface,
    blockInputToData,
    createBlock,
    ExtractBlockInput,
    SimpleBlockInputInterface,
} from "../block";
import { ChildBlock } from "../decorators/child-block";
import { ChildBlockInput } from "../decorators/child-block-input";
import { BlockFactoryNameOrOptions } from "./types";

interface CreateImageLinkBlockOptions<LinkBlock extends Block, ImageBlock extends Block> {
    image?: ImageBlock;
    link: LinkBlock;
}

interface ImageLinkBlockInputInterface<
    LinkBlockInput extends BlockInputInterface,
    ImageBlockInput extends BlockInputInterface,
> extends SimpleBlockInputInterface {
    link: LinkBlockInput;
    image: ImageBlockInput;
}

export function createImageLinkBlock<LinkBlock extends Block, ImageBlock extends Block = typeof PixelImageBlock>(
    options: CreateImageLinkBlockOptions<LinkBlock, ImageBlock>,
    nameOrOptions: BlockFactoryNameOrOptions = "ImageLink",
): Block<BlockDataInterface, ImageLinkBlockInputInterface<ExtractBlockInput<LinkBlock>, ExtractBlockInput<ImageBlock>>> {
    const image = options.image || PixelImageBlock;
    const link = options.link;

    class ImageLinkBlockData extends BlockData {
        @ChildBlock(link)
        link: BlockDataInterface;

        @ChildBlock(image)
        image: BlockDataInterface;
    }

    class ImageLinkBlockInput extends BlockInput {
        @ChildBlockInput(link)
        link: ExtractBlockInput<LinkBlock>;

        @ChildBlockInput(image)
        image: ExtractBlockInput<ImageBlock>;

        transformToBlockData(): ImageLinkBlockData {
            return blockInputToData(ImageLinkBlockData, this);
        }
    }

    return createBlock(ImageLinkBlockData, ImageLinkBlockInput, nameOrOptions);
}
