import { createBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { CallToActionListBlock } from "../../../common/blocks/call-to-action.block";
import { HeadingBlock } from "../../../common/blocks/heading.block";
import { MediaBlock } from "../../../common/blocks/media.block";
import { RichTextBlock } from "../../../common/blocks/rich-text.block";
import { overlay } from "./stage.block";

export const BillboardTeaserBlock = createBlock(
    "BillboardTeaser",
    z.strictObject({
        media: MediaBlock.schema,
        heading: HeadingBlock.schema,
        text: RichTextBlock.schema,
        overlay,
        callToActionList: CallToActionListBlock.schema,
    }),
);
