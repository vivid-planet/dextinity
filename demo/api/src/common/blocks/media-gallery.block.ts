import {
    BlockData,
    BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    createListBlock,
    ExtractBlockInput,
} from "@dextinity/cms-api";
import { MediaGalleryItemBlock } from "@src/common/blocks/media-gallery-item.block";
import { MediaAspectRatios } from "@src/util/mediaAspectRatios";
import { IsEnum } from "class-validator";

export const MediaGalleryListBlock = createListBlock(
    { block: MediaGalleryItemBlock },
    { name: "MediaGalleryList", description: "The items of a media gallery." },
);

class MediaGalleryBlockData extends BlockData {
    @ChildBlock(MediaGalleryListBlock)
    items: BlockDataInterface;

    @BlockField({ type: "enum", enum: MediaAspectRatios })
    aspectRatio: MediaAspectRatios;
}

class MediaGalleryBlockInput extends BlockInput {
    @ChildBlockInput(MediaGalleryListBlock)
    items: ExtractBlockInput<typeof MediaGalleryListBlock>;

    @IsEnum(MediaAspectRatios)
    @BlockField({ type: "enum", enum: MediaAspectRatios })
    aspectRatio: MediaAspectRatios;

    transformToBlockData(): MediaGalleryBlockData {
        return blockInputToData(MediaGalleryBlockData, this);
    }
}

export const MediaGalleryBlock = createBlock(MediaGalleryBlockData, MediaGalleryBlockInput, {
    name: "MediaGallery",
    description: "A gallery of images and videos, all shown in the same aspect ratio.",
});
