import { createOneOfBlock, DamImageBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

export const TipTapTableCellBlock = createOneOfBlock({
    supportedBlocks: { richText: TipTapRichTextBlock, image: DamImageBlock },
    name: "TipTapTableCell",
    displayName: <FormattedMessage id="tipTapTableCellBlock.displayName" defaultMessage="Table cell" />,
    allowEmpty: false,
    variant: "toggle",
});
