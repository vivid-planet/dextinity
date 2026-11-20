import { createTipTapRichTextBlock } from "@dextinity/mail-react";
import type { PhoneLinkBlockData } from "@src/blocks.generated.js";

export const { MjmlTipTapRichTextBlock: MjmlRichTextBlock } = createTipTapRichTextBlock({
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});
