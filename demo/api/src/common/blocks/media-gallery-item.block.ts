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
    IsNullable,
} from "@dextinity/cms-api";
import { MediaBlock } from "@src/common/blocks/media.block.js";
import { IsString } from "class-validator";

class MediaGalleryItemBlockData extends BlockData {
    @ChildBlock(MediaBlock)
    media: BlockDataInterface;

    @BlockField({ type: "string", nullable: true })
    caption: string | null;
}

class MediaGalleryItemBlockInput extends BlockInput {
    @ChildBlockInput(MediaBlock)
    media: ExtractBlockInput<typeof MediaBlock>;

    @IsNullable()
    @BlockField({ type: "string", nullable: true })
    @IsString()
    caption: string | null;

    transformToBlockData(): MediaGalleryItemBlockData {
        return blockInputToData(MediaGalleryItemBlockData, this);
    }
}

export const MediaGalleryItemBlock = createBlock(MediaGalleryItemBlockData, MediaGalleryItemBlockInput, "MediaGalleryItem");
