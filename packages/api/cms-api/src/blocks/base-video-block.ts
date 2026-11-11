import { IsBoolean } from "class-validator";

import { IsUndefinable } from "../common/validators/is-undefinable";
import { PixelImageBlock } from "../dam/blocks/pixel-image.block";
import { BlockData, BlockDataInterface, BlockInput, blockInputToData, ExtractBlockInput } from "./block";
import { ChildBlock } from "./decorators/child-block";
import { ChildBlockInput } from "./decorators/child-block-input";
import { BlockField } from "./decorators/field";

export class BaseVideoBlockData extends BlockData {
    @BlockField({ nullable: true })
    autoplay?: boolean;

    @BlockField({ nullable: true })
    showControls?: boolean;

    @BlockField({ nullable: true })
    loop?: boolean;

    @ChildBlock(PixelImageBlock)
    previewImage: BlockDataInterface;
}

export class BaseVideoBlockInput extends BlockInput {
    @IsBoolean()
    @IsUndefinable()
    @BlockField({ nullable: true })
    autoplay?: boolean;

    @IsBoolean()
    @IsUndefinable()
    @BlockField({ nullable: true })
    showControls?: boolean;

    @IsBoolean()
    @IsUndefinable()
    @BlockField({ nullable: true })
    loop?: boolean;

    @ChildBlockInput(PixelImageBlock)
    previewImage: ExtractBlockInput<typeof PixelImageBlock>;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(BaseVideoBlockData, this);
    }
}
