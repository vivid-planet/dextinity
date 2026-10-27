import { createBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { layoutBlockLayouts } from "../../../shared/blocks";
import { MediaBlock } from "./media.block";
import { RichTextBlock } from "./rich-text.block";

// Every layout shows some of the blocks only, the others keep their content for switching back
export const LayoutBlock = createBlock(
    "Layout",
    z.strictObject({
        layout: z.enum(layoutBlockLayouts),
        media1: MediaBlock.schema,
        text1: RichTextBlock.schema,
        media2: MediaBlock.schema,
        text2: RichTextBlock.schema,
    }),
);
