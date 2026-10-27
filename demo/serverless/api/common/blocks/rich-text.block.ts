import { createRichTextBlock } from "@dextinity/serverless/server";

import { LinkBlock } from "./link.block";

// The admin's rich text blocks differ in their editor options only (supported styles, number of blocks), their input is the same
export const RichTextBlock = createRichTextBlock({ link: LinkBlock });
