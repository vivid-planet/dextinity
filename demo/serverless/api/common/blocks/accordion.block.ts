import { createBlock, createBlocksBlock, createListBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { headingTags } from "../../../shared/blocks";
import { RichTextBlock } from "./rich-text.block";
import { SpaceBlock } from "./space.block";
import { StandaloneCallToActionListBlock, StandaloneHeadingBlock } from "./standalone-blocks.block";
import { TextImageBlock } from "./text-image.block";

const AccordionContentBlock = createBlocksBlock({
    name: "AccordionContent",
    supportedBlocks: {
        richtext: RichTextBlock,
        space: SpaceBlock,
        heading: StandaloneHeadingBlock,
        callToActionList: StandaloneCallToActionListBlock,
        textImage: TextImageBlock,
    },
});

const AccordionItemBlock = createBlock(
    "AccordionItem",
    z.strictObject({
        title: z.string().optional(),
        titleHtmlTag: z.enum(headingTags),
        content: AccordionContentBlock.schema,
        openByDefault: z.boolean(),
    }),
);

export const AccordionBlock = createListBlock({ name: "Accordion", block: AccordionItemBlock });
