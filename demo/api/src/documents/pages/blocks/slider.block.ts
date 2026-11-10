import {
    BlockData,
    BlockDataInterface,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    createListBlock,
    ExtractBlockInput,
    typeSafeBlockMigrationPipe,
} from "@dextinity/cms-api";
import { MediaBlock } from "@src/common/blocks/media.block";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";

import { RemoveSliderListMigration } from "./slider/migrations/1-remove-slider-list.migration";

class SliderItemBlockData extends BlockData {
    @ChildBlock(MediaBlock)
    media: BlockDataInterface;

    @ChildBlock(RichTextBlock)
    text: BlockDataInterface;
}

class SliderItemBlockInput extends BlockInput {
    @ChildBlockInput(MediaBlock)
    media: ExtractBlockInput<typeof MediaBlock>;

    @ChildBlockInput(RichTextBlock)
    text: ExtractBlockInput<typeof RichTextBlock>;

    transformToBlockData(): SliderItemBlockData {
        return blockInputToData(SliderItemBlockData, this);
    }
}

const SliderItemBlock = createBlock(SliderItemBlockData, SliderItemBlockInput, "SliderItem");

export const SliderBlock = createListBlock(
    { block: SliderItemBlock },
    {
        name: "Slider",
        migrate: {
            migrations: typeSafeBlockMigrationPipe([RemoveSliderListMigration]),
            version: 1,
        },
    },
);
