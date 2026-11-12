import { createTableBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { createResponsiveTableBlock } from "./table/createResponsiveTableBlock";
import { TipTapRichTextBlock } from "./TipTapRichTextBlock";

const TableContentBlock = createTableBlock({ richText: TipTapRichTextBlock, name: "TableContent" });

export const TableBlock = createResponsiveTableBlock({
    name: "Table",
    displayName: <FormattedMessage id="tableBlock.displayName" defaultMessage="Table" />,
    tableContentBlock: TableContentBlock,
});
