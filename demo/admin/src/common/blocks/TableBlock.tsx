import { FormattedMessage } from "react-intl";

import { RichTextBlock } from "./RichTextBlock";
import { createTableBlockWithResponsiveBehavior } from "./table/createTableBlockWithResponsiveBehavior";
import { createTableContentBlock } from "./table/createTableContentBlock";

const TableContentBlock = createTableContentBlock({ richText: RichTextBlock, name: "TableContent" });

export const TableBlock = createTableBlockWithResponsiveBehavior({
    name: "Table",
    displayName: <FormattedMessage id="tableBlock.displayName" defaultMessage="Table" />,
    tableContentBlock: TableContentBlock,
});
