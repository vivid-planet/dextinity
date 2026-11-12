import { createTableBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { RichTextBlock } from "./RichTextBlock";
import { createResponsiveTableBlock } from "./table/createResponsiveTableBlock";

const TableContentBlock = createTableBlock({ richText: RichTextBlock, name: "TableContent" });

export const TableBlock = createResponsiveTableBlock({
    name: "Table",
    displayName: <FormattedMessage id="tableBlock.displayName" defaultMessage="Table" />,
    tableContentBlock: TableContentBlock,
});
