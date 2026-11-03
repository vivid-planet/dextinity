import { IsBoolean, IsOptional } from "class-validator";

import { PixelImageBlock } from "../dam/blocks/pixel-image.block";
import { BlockData, BlockDataInterface, BlockInput, blockInputToData, ExtractBlockInput } from "./block";
import { ChildBlock } from "./decorators/child-block";
import { ChildBlockInput } from "./decorators/child-block-input";
import { BlockField } from "./decorators/field";

export class BaseVideoBlockData extends BlockData {
    @BlockField({ type: "boolean", nullable: true })
    autoplay?: boolean | null;

    @BlockField({ type: "boolean", nullable: true })
    showControls?: boolean | null;

    @BlockField({ type: "boolean", nullable: true })
    loop?: boolean | null;

    @ChildBlock(PixelImageBlock)
    previewImage: BlockDataInterface;
}

export class BaseVideoBlockInput extends BlockInput {
    @IsBoolean()
    @IsOptional()
    @BlockField({ type: "boolean", nullable: true })
    autoplay?: boolean | null;

    @IsBoolean()
    @IsOptional()
    @BlockField({ type: "boolean", nullable: true })
    showControls?: boolean | null;

    @IsBoolean()
    @IsOptional()
    @BlockField({ type: "boolean", nullable: true })
    loop?: boolean | null;

    @ChildBlockInput(PixelImageBlock)
    previewImage: ExtractBlockInput<typeof PixelImageBlock>;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(BaseVideoBlockData, this);
    }
}
