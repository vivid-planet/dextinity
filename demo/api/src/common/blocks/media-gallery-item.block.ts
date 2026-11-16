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
    IsUndefinable,
} from "@dextinity/cms-api";
import { MediaBlock } from "@src/common/blocks/media.block.js";
import { IsString } from "class-validator";

class MediaGalleryItemBlockData extends BlockData {
    @ChildBlock(MediaBlock)
    media: BlockDataInterface;

    @BlockField({ nullable: true })
    caption?: string;
}

class MediaGalleryItemBlockInput extends BlockInput {
    @ChildBlockInput(MediaBlock)
    media: ExtractBlockInput<typeof MediaBlock>;

    @IsUndefinable()
    @BlockField({ nullable: true })
    @IsString()
    caption?: string;

    transformToBlockData(): MediaGalleryItemBlockData {
        return blockInputToData(MediaGalleryItemBlockData, this);
    }
}

export const MediaGalleryItemBlock = createBlock(MediaGalleryItemBlockData, MediaGalleryItemBlockInput, "MediaGalleryItem");
