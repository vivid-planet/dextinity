import { createListBlock } from "@dextinity/cms-api";

import { TeaserItemBlock } from "./teaser-item.block";

export const TeaserBlock = createListBlock({ block: TeaserItemBlock }, { name: "Teaser", description: "A list of teasers." });
