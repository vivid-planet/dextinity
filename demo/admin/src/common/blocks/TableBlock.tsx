import { createTableBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { createResponsiveTableBlock } from "./table/createResponsiveTableBlock";
import { PriceCellBlock } from "./table/PriceCellBlock";
import { TableCellRichTextBlock } from "./table/TableCellRichTextBlock";

const TableContentBlock = createTableBlock({ cellBlocks: { richText: TableCellRichTextBlock, price: PriceCellBlock }, name: "TableContent" });

export const TableBlock = createResponsiveTableBlock({
    name: "Table",
    displayName: <FormattedMessage id="tableBlock.displayName" defaultMessage="Table" />,
    tableContentBlock: TableContentBlock,
});
