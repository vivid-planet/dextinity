import { createRichTextBlock } from "@dextinity/mail-react";
import type { PhoneLinkBlockData } from "@src/blocks.generated";

export const { MjmlRichTextBlock } = createRichTextBlock({
    blockTypes: {
        "header-one": { variant: "heading" },
        "paragraph-standard": { variant: "body" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});
