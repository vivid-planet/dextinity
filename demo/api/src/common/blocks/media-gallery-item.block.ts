import {
    BlockData,
    BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    ExtractBlockInput,
    IsUndefinable,
} from "@dextinity/cms-api";
import { MediaBlock } from "@src/common/blocks/media.block";
import { IsString } from "class-validator";

class MediaGalleryItemBlockData extends BlockData {
    @ChildBlock(MediaBlock)
    media: BlockDataInterface;

    @BlockField({ type: "string", nullable: true })
    caption?: string | null;
}

class MediaGalleryItemBlockInput extends BlockInput {
    @ChildBlockInput(MediaBlock)
    media: ExtractBlockInput<typeof MediaBlock>;

    @IsUndefinable()
    @BlockField({ type: "string", nullable: true })
    @IsString()
    caption?: string | null;

    transformToBlockData(): MediaGalleryItemBlockData {
        return blockInputToData(MediaGalleryItemBlockData, this);
    }
}

export const MediaGalleryItemBlock = createBlock(MediaGalleryItemBlockData, MediaGalleryItemBlockInput, "MediaGalleryItem");
