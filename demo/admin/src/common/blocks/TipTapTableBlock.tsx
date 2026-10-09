import { FormattedMessage } from "react-intl";

import { createTableBlockWithResponsiveBehavior } from "./table/createTableBlockWithResponsiveBehavior";
import { createTableContentBlock } from "./table/createTableContentBlock";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

const TipTapTableContentBlock = createTableContentBlock({ richText: TipTapRichTextBlock, name: "TipTapTableContent" });

export const TipTapTableBlock = createTableBlockWithResponsiveBehavior({
    name: "TipTapTable",
    displayName: <FormattedMessage id="tipTapTableBlock.displayName" defaultMessage="Table (TipTap)" />,
    tableContentBlock: TipTapTableContentBlock,
});
