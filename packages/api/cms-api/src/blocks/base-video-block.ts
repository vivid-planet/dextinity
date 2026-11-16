import { IsBoolean, IsOptional } from "class-validator";

import { PixelImageBlock } from "../dam/blocks/pixel-image.block.js";
import { BlockData, type BlockDataInterface, BlockInput, blockInputToData, type ExtractBlockInput } from "./block.js";
import { ChildBlock } from "./decorators/child-block.js";
import { ChildBlockInput } from "./decorators/child-block-input.js";
import { BlockField } from "./decorators/field.js";

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
    @IsOptional()
    @BlockField({ nullable: true })
    autoplay?: boolean;

    @IsBoolean()
    @IsOptional()
    @BlockField({ nullable: true })
    showControls?: boolean;

    @IsBoolean()
    @IsOptional()
    @BlockField({ nullable: true })
    loop?: boolean;

    @ChildBlockInput(PixelImageBlock)
    previewImage: ExtractBlockInput<typeof PixelImageBlock>;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(BaseVideoBlockData, this);
    }
}
