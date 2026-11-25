import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { TextCellBlockData } from "@src/blocks.generated";

import { RichTextBlock } from "../RichTextBlock";
import { TableCellWithBadges } from "./TableCellWithBadges";

export const TextCellBlock = withPreview(
    ({ data: { text, badges } }: PropsWithData<TextCellBlockData>) => (
        <TableCellWithBadges badges={badges}>
            <RichTextBlock data={text} disableLastBottomSpacing />
        </TableCellWithBadges>
    ),
    { label: "Text" },
);
