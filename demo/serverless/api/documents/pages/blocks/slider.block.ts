import { createBlock, createListBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { MediaBlock } from "../../../common/blocks/media.block";
import { RichTextBlock } from "../../../common/blocks/rich-text.block";

const SliderItemBlock = createBlock("SliderItem", z.strictObject({ media: MediaBlock.schema, text: RichTextBlock.schema }));

export const SliderBlock = createBlock(
    "Slider",
    z.strictObject({ sliderList: createListBlock({ name: "SliderList", block: SliderItemBlock }).schema }),
);
