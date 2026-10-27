import { createTextImageBlock } from "@dextinity/cms-admin";
import { DamImageBlock } from "@dextinity/serverless/client";

import { RichTextBlock } from "./RichTextBlock";

export const TextImageBlock = createTextImageBlock({ text: RichTextBlock, image: DamImageBlock });
