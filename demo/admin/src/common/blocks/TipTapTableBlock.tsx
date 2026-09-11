import { createTableBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

export const TipTapTableBlock = createTableBlock({ richText: TipTapRichTextBlock, name: "TipTapTable" }, (block) => ({
    ...block,
    displayName: <FormattedMessage id="tipTapTableBlock.displayName" defaultMessage="Table (TipTap)" />,
}));
