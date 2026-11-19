import { createTableBlock } from "@dextinity/cms-api";

import { createResponsiveTableBlock } from "./table/create-responsive-table-block";
import { TipTapRichTextBlock } from "./tip-tap-rich-text.block";

const TipTapTableContentBlock = createTableBlock({ richText: TipTapRichTextBlock }, "TipTapTableContent");

export const TipTapTableBlock = createResponsiveTableBlock({ tableContentBlock: TipTapTableContentBlock, name: "TipTapTable" });
