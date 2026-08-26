import { createTipTapTableBlock } from "@dextinity/cms-api";

import { LinkBlock } from "./link.block";

export const TipTapTableBlock = createTipTapTableBlock(
    {
        link: LinkBlock,
        textBlockStyles: [
            { name: "paragraph300", appliesTo: ["paragraph"] },
            { name: "paragraph200", appliesTo: ["paragraph"] },
        ],
        inlineStyles: [{ name: "highlight" }],
    },
    "TipTapTable",
);
