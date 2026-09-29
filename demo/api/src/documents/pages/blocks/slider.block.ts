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
} from "@dextinity/cms-api";
import { MediaBlock } from "@src/common/blocks/media.block";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";

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

const SliderItemBlock = createBlock(SliderItemBlockData, SliderItemBlockInput, {
    name: "SliderItem",
});

const SliderListBlock = createListBlock({ block: SliderItemBlock }, "SliderList");

class SliderBlockData extends BlockData {
    @ChildBlock(SliderListBlock)
    sliderList: BlockDataInterface;
}

class SliderBlockInput extends BlockInput {
    @ChildBlockInput(SliderListBlock)
    sliderList: ExtractBlockInput<typeof SliderListBlock>;

    transformToBlockData(): SliderBlockData {
        return blockInputToData(SliderBlockData, this);
    }
}

export const SliderBlock = createBlock(SliderBlockData, SliderBlockInput, {
    name: "Slider",
});
