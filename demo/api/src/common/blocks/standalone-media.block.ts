import {
    BlockData,
    type BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    type ExtractBlockInput,
} from "@dextinity/cms-api";
import { MediaBlock } from "@src/common/blocks/media.block.js";
import { MediaAspectRatios } from "@src/util/mediaAspectRatios.js";
import { IsEnum } from "class-validator";

class StandaloneMediaBlockData extends BlockData {
    @ChildBlock(MediaBlock)
    media: BlockDataInterface;

    @BlockField({ type: "enum", enum: MediaAspectRatios })
    aspectRatio: MediaAspectRatios;
}

class StandaloneMediaBlockInput extends BlockInput {
    @ChildBlockInput(MediaBlock)
    media: ExtractBlockInput<typeof MediaBlock>;

    @IsEnum(MediaAspectRatios)
    @BlockField({ type: "enum", enum: MediaAspectRatios })
    aspectRatio: MediaAspectRatios;

    transformToBlockData(): StandaloneMediaBlockData {
        return blockInputToData(StandaloneMediaBlockData, this);
    }
}

export const StandaloneMediaBlock = createBlock(StandaloneMediaBlockData, StandaloneMediaBlockInput, {
    name: "StandaloneMedia",
});
