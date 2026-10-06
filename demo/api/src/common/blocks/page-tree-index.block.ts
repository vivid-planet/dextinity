import { BlockData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";

class PageTreeIndexBlockData extends BlockData {}

class PageTreeIndexBlockInput extends BlockInput {
    transformToBlockData(): PageTreeIndexBlockData {
        return blockInputToData(PageTreeIndexBlockData, this);
    }
}

export const PageTreeIndexBlock = createBlock(PageTreeIndexBlockData, PageTreeIndexBlockInput, {
    name: "PageTreeIndex",
    description: "A list of the pages below the current page in the page tree.",
});
