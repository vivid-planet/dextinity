import { createTableBlock } from "@dextinity/cms-api";

import { createResponsiveTableBlock } from "./table/create-responsive-table-block";
import { TipTapTableCellBlock } from "./tip-tap-table-cell.block";

const TipTapTableContentBlock = createTableBlock({ richText: TipTapTableCellBlock }, "TipTapTableContent");

export const TipTapTableBlock = createResponsiveTableBlock({ tableContentBlock: TipTapTableContentBlock, name: "TipTapTable" });
