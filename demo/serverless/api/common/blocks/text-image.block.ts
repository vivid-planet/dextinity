import { createTextImageBlock, DamImageBlock } from "@dextinity/serverless/server";

import { imageAspectRatios } from "../../../shared/blocks";
import { RichTextBlock } from "./rich-text.block";

export const TextImageBlock = createTextImageBlock({ text: RichTextBlock, image: DamImageBlock, imageAspectRatios });
