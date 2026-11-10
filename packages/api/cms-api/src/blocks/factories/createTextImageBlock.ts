import { Type } from "class-transformer";
import { IsEnum, IsString } from "class-validator";

import { PixelImageBlock } from "../../dam/blocks/pixel-image.block";
import { IsAllowedImageAspectRatio } from "../../dam/images/validators/is-allowed-aspect-ratio.validator";
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
import { BlockField } from "../decorators/field";

export enum ImagePosition {
    Left = "left",
    Right = "right",
}

interface CreateTextImageBlockOptions<TextBlock extends Block, ImageBlock extends Block> {
    text: TextBlock;
    image?: ImageBlock;
}

interface TextImageBlockInputInterface<
    TextBlockInput extends BlockInputInterface,
    ImageBlockInput extends BlockInputInterface,
> extends SimpleBlockInputInterface {
    text: TextBlockInput;
    image: ImageBlockInput;
    imagePosition: ImagePosition;
    imageAspectRatio: string;
}

export function createTextImageBlock<TextBlock extends Block, ImageBlock extends Block = typeof PixelImageBlock>(
    options: CreateTextImageBlockOptions<TextBlock, ImageBlock>,
): Block<BlockDataInterface, TextImageBlockInputInterface<ExtractBlockInput<TextBlock>, ExtractBlockInput<ImageBlock>>> {
    const image = options.image || PixelImageBlock;
    const text = options.text;

    class TextImageBlockData extends BlockData {
        @ChildBlock(text)
        text: BlockDataInterface;

        @ChildBlock(image)
        image: BlockDataInterface;

        @Type()
        @BlockField({
            type: "enum",
            enum: ImagePosition,
        })
        imagePosition: ImagePosition;

        @BlockField()
        imageAspectRatio: string;
    }

    class TextImageBlockInput
        extends BlockInput
        implements TextImageBlockInputInterface<ExtractBlockInput<TextBlock>, ExtractBlockInput<ImageBlock>>
    {
        @ChildBlockInput(text)
        text: ExtractBlockInput<TextBlock>;

        @ChildBlockInput(image)
        image: ExtractBlockInput<ImageBlock>;

        @Type()
        @IsEnum(ImagePosition)
        @BlockField({
            type: "enum",
            enum: ImagePosition,
        })
        imagePosition: ImagePosition;

        @IsString()
        @IsAllowedImageAspectRatio()
        @BlockField()
        imageAspectRatio: string;

        transformToBlockData(): TextImageBlockData {
            return blockInputToData(TextImageBlockData, this);
        }
    }

    return createBlock(TextImageBlockData, TextImageBlockInput, "TextImage");
}
