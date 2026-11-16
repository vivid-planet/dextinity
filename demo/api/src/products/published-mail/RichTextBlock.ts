import { createTipTapRichTextBlock } from "@dextinity/mail-react";
import type { PhoneLinkBlockData } from "@src/blocks.generated.js";

export const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock({
    textBlocks: {
        paragraph: { variant: "body" },
        "heading-1": { variant: "heading" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});
