import { createTableBlock, DamImageBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

import { createResponsiveTableBlock } from "./table/createResponsiveTableBlock";
import { PriceCellBlock } from "./table/PriceCellBlock";
import { convertPriceToTextCell, convertTextToPriceCell } from "./table/tableCellConversions";
import { TextCellBlock } from "./table/TextCellBlock";

const TableContentBlock = createTableBlock({
    cellBlocks: { text: TextCellBlock, price: PriceCellBlock, image: DamImageBlock },
    convertCell: {
        text: { price: convertTextToPriceCell },
        price: { text: convertPriceToTextCell },
    },
    name: "TableContent",
});

export const TableBlock = createResponsiveTableBlock({
    name: "Table",
    displayName: <FormattedMessage id="tableBlock.displayName" defaultMessage="Table" />,
    tableContentBlock: TableContentBlock,
});
