import { IsBoolean } from "class-validator";

import { IsNullable } from "../common/validators/is-nullable.js";
import { PixelImageBlock } from "../dam/blocks/pixel-image.block.js";
import { BlockData, type BlockDataInterface, BlockInput, blockInputToData, type ExtractBlockInput } from "./block.js";
import { ChildBlock } from "./decorators/child-block.js";
import { ChildBlockInput } from "./decorators/child-block-input.js";
import { BlockField } from "./decorators/field.js";

export class BaseVideoBlockData extends BlockData {
    @BlockField({ type: "boolean", nullable: true })
    autoplay: boolean | null;

    @BlockField({ type: "boolean", nullable: true })
    showControls: boolean | null;

    @BlockField({ type: "boolean", nullable: true })
    loop: boolean | null;

    @ChildBlock(PixelImageBlock)
    previewImage: BlockDataInterface;
}

export class BaseVideoBlockInput extends BlockInput {
    @IsBoolean()
    @IsNullable()
    @BlockField({ type: "boolean", nullable: true })
    autoplay: boolean | null;

    @IsBoolean()
    @IsNullable()
    @BlockField({ type: "boolean", nullable: true })
    showControls: boolean | null;

    @IsBoolean()
    @IsNullable()
    @BlockField({ type: "boolean", nullable: true })
    loop: boolean | null;

    @ChildBlockInput(PixelImageBlock)
    previewImage: ExtractBlockInput<typeof PixelImageBlock>;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(BaseVideoBlockData, this);
    }
}
