import { createListBlock } from "@dextinity/cms-api";

import { TeaserItemBlock } from "./teaser-item.block.js";

export const TeaserBlock = createListBlock({ block: TeaserItemBlock }, "Teaser");
