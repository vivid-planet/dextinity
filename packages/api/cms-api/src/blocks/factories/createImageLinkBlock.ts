import { PixelImageBlock } from "../../dam/blocks/pixel-image.block.js";
import {
    type Block,
    BlockData,
    type BlockDataInterface,
    BlockInput,
    type BlockInputInterface,
    blockInputToData,
    createBlock,
    type ExtractBlockInput,
    type SimpleBlockInputInterface,
} from "../block.js";
import { ChildBlock } from "../decorators/child-block.js";
import { ChildBlockInput } from "../decorators/child-block-input.js";
import type { BlockFactoryNameOrOptions } from "./types.js";

interface CreateImageLinkBlockOptions<LinkBlock extends Block, ImageBlock extends Block> {
    image?: ImageBlock;
    link: LinkBlock;
}

interface ImageLinkBlockInputInterface<LinkBlockInput extends BlockInputInterface, ImageBlockInput extends BlockInputInterface>
    extends SimpleBlockInputInterface {
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
