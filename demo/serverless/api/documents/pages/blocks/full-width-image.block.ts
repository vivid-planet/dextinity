import { createBlock, createOptionalBlock, DamImageBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { RichTextBlock } from "../../../common/blocks/rich-text.block";

export const FullWidthImageBlock = createBlock(
    "FullWidthImage",
    z.strictObject({ image: DamImageBlock.schema, content: createOptionalBlock(RichTextBlock).schema }),
);
