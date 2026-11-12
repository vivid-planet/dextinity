import { createTextImageBlock, DamImageBlock } from "@dextinity/cms-admin";
import { TipTapRichTextBlock } from "@src/common/blocks/TipTapRichTextBlock";

type TextBlock = Parameters<typeof createTextImageBlock>[0]["text"];

// createTextImageBlock is typed for the DraftJS-based RichTextBlock only, but composes any text block at runtime.
export const TextImageBlock = createTextImageBlock({ text: TipTapRichTextBlock as unknown as TextBlock, image: DamImageBlock });
