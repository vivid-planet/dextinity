import { createTextImageBlock, DamImageBlock } from "@dextinity/cms-admin";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";

export const TextImageBlock = createTextImageBlock({
    // @ts-expect-error createTextImageBlock is typed for the Draft.js-based RichTextBlock only, but composes any text block at runtime
    text: RichTextBlock,
    image: DamImageBlock,
});
