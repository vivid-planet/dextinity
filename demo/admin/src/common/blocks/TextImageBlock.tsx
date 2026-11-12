import { createTextImageBlock, DamImageBlock } from "@dextinity/cms-admin";
import { TipTapRichTextBlock } from "@src/common/blocks/TipTapRichTextBlock";

export const TextImageBlock = createTextImageBlock({
    // @ts-expect-error createTextImageBlock is typed for the Draft.js-based RichTextBlock only, but composes any text block at runtime
    text: TipTapRichTextBlock,
    image: DamImageBlock,
});
