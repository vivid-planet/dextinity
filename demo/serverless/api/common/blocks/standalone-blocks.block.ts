import { createBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { mediaAspectRatios } from "../../../shared/blocks";
import { CallToActionListBlock } from "./call-to-action.block";
import { HeadingBlock } from "./heading.block";
import { MediaBlock } from "./media.block";
import { RichTextBlock } from "./rich-text.block";

export const StandaloneHeadingBlock = createBlock(
    "StandaloneHeading",
    z.strictObject({ heading: HeadingBlock.schema, textAlignment: z.enum(["left", "center"]) }),
);

export const StandaloneRichTextBlock = createBlock(
    "StandaloneRichText",
    z.strictObject({ richText: RichTextBlock.schema, textAlignment: z.enum(["left", "center", "right", "justify"]) }),
);

export const StandaloneCallToActionListBlock = createBlock(
    "StandaloneCallToActionList",
    z.strictObject({ callToActionList: CallToActionListBlock.schema, alignment: z.enum(["left", "center", "right"]) }),
);

export const StandaloneMediaBlock = createBlock(
    "StandaloneMedia",
    z.strictObject({ media: MediaBlock.schema, aspectRatio: z.enum(mediaAspectRatios) }),
);
