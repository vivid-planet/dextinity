import { createListBlock } from "@dextinity/cms-api";

import { TeaserItemBlock } from "./teaser-item.block";

export const TeaserBlock = createListBlock({ block: TeaserItemBlock }, "Teaser");
