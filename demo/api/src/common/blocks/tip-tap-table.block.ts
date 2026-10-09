import { createTableBlock } from "@dextinity/cms-api";

import { createTableBlockWithResponsiveBehavior } from "./table/create-table-block-with-responsive-behavior";
import { TipTapRichTextBlock } from "./tip-tap-rich-text.block";

const TipTapTableContentBlock = createTableBlock({ richText: TipTapRichTextBlock }, "TipTapTableContent");

export const TipTapTableBlock = createTableBlockWithResponsiveBehavior({ tableContentBlock: TipTapTableContentBlock, name: "TipTapTable" });
