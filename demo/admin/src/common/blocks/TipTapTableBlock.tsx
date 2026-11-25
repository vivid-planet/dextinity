import { createTableBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { createResponsiveTableBlock } from "./table/createResponsiveTableBlock";
import { TipTapTableCellBlock } from "./TipTapTableCellBlock";

const TipTapTableContentBlock = createTableBlock({ richText: TipTapTableCellBlock, name: "TipTapTableContent" });

export const TipTapTableBlock = createResponsiveTableBlock({
    name: "TipTapTable",
    displayName: <FormattedMessage id="tipTapTableBlock.displayName" defaultMessage="Table (TipTap)" />,
    tableContentBlock: TipTapTableContentBlock,
});
