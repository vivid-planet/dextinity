import { createTextImageBlock, DamImageBlock } from "@dextinity/cms-admin";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";

export const TextImageBlock = createTextImageBlock({ text: RichTextBlock, image: DamImageBlock });
