import { createRichTextBlock } from "@dextinity/cms-api";

import { LinkBlock } from "./link.block.js";

export const RichTextBlock = createRichTextBlock({ link: LinkBlock });
