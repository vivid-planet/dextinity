import { createTableBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { createResponsiveTableBlock } from "./table/createResponsiveTableBlock";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

const TipTapTableContentBlock = createTableBlock({ richText: TipTapRichTextBlock, name: "TipTapTableContent" });

export const TipTapTableBlock = createResponsiveTableBlock({
    name: "TipTapTable",
    displayName: <FormattedMessage id="tipTapTableBlock.displayName" defaultMessage="Table (TipTap)" />,
    tableContentBlock: TipTapTableContentBlock,
});
