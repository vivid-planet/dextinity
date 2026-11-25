import { createTipTapRichTextBlock } from "@dextinity/cms-api";
import { LinkBlock } from "@src/common/blocks/link.block.js";

const listStyles = [{ name: "list300" }, { name: "list200" }];

export const TableCellRichTextBlock = createTipTapRichTextBlock(
    {
        link: LinkBlock,
        textBlocks: [{ name: "paragraph", tag: "p", styles: [{ name: "paragraph300" }, { name: "paragraph200" }], defaultStyle: "paragraph300" }],
        orderedList: { styles: listStyles, defaultStyle: "list300" },
        unorderedList: { styles: listStyles, defaultStyle: "list300" },
        textAlign: { left: true, center: true, right: true },
    },
    "TableCellRichText",
);
