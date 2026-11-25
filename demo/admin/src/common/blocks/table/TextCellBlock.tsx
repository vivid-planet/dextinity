import { type BlockState, createCompositeBlock, type ReadOnlyBlockRenderInterface } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { createTableCellBadgesField } from "./createTableCellBadgesField";
import { paddedInCellPopover } from "./paddedInCellPopover";
import { TableCellRichTextBlock } from "./TableCellRichTextBlock";

const TextCellCompositeBlock = createCompositeBlock({
    name: "TextCell",
    displayName: <FormattedMessage id="textCellBlock.displayName" defaultMessage="Text" />,
    groups: {
        text: {
            ...paddedInCellPopover,
            blocks: {
                text: { block: TableCellRichTextBlock },
                badges: { block: createTableCellBadgesField() },
            },
        },
    },
});

export const TextCellBlock: typeof TextCellCompositeBlock & ReadOnlyBlockRenderInterface<BlockState<typeof TextCellCompositeBlock>> = {
    ...TextCellCompositeBlock,
    ReadOnlyComponent: ({ state: { text } }) => <TableCellRichTextBlock.ReadOnlyComponent state={text} />,
};
