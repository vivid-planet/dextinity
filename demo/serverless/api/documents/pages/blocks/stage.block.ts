import { createBlock, createListBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { CallToActionListBlock } from "../../../common/blocks/call-to-action.block";
import { HeadingBlock } from "../../../common/blocks/heading.block";
import { MediaBlock } from "../../../common/blocks/media.block";
import { RichTextBlock } from "../../../common/blocks/rich-text.block";

/** In percent */
export const overlay = z.number().int().min(0).max(90);

const BasicStageBlock = createBlock(
    "BasicStage",
    z.strictObject({
        media: MediaBlock.schema,
        heading: HeadingBlock.schema,
        text: RichTextBlock.schema,
        overlay,
        alignment: z.enum(["left", "center"]),
        callToActionList: CallToActionListBlock.schema,
    }),
);

export const StageBlock = createListBlock({ name: "Stage", block: BasicStageBlock });
