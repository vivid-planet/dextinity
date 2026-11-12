import { createTextImageBlock, DamImageBlock } from "@dextinity/cms-api";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block.js";

export const TextImageBlock = createTextImageBlock({ text: TipTapRichTextBlock, image: DamImageBlock });
