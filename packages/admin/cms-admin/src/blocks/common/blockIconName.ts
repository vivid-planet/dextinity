import type { IconName } from "@dextinity/ui";

import { BlockCategory, type BlockInterface } from "../types";

const categoryIconNames: Record<BlockCategory, IconName> = {
    [BlockCategory.TextAndContent]: "heading",
    [BlockCategory.Media]: "image",
    [BlockCategory.Navigation]: "link",
    [BlockCategory.Teaser]: "story",
    [BlockCategory.StructuredContent]: "layers",
    [BlockCategory.Layout]: "columns-2",
    [BlockCategory.Form]: "edit-page",
    [BlockCategory.Other]: "blocks",
};

export function blockIconName(block: Pick<BlockInterface, "iconName" | "category">): IconName {
    if (block.iconName !== undefined) {
        return block.iconName;
    }

    return typeof block.category === "string" ? categoryIconNames[block.category] : categoryIconNames[BlockCategory.Other];
}
