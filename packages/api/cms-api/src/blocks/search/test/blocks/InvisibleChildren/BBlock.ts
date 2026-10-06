import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

import {
    BlockData,
    BlockInput,
    blockInputToData,
    type ChildBlockInfo,
    createBlock,
    type ExtractBlockData,
    type ExtractBlockInput,
} from "../../../../block.js";
import { ChildBlock } from "../../../../decorators/child-block.js";
import { ChildBlockInput } from "../../../../decorators/child-block-input.js";
import { BlockField } from "../../../../decorators/field.js";
import type { SearchText } from "../../../get-search-text.js";
import { CBlock } from "../A/CBlock.js";

class BBlockData extends BlockData {
    @BlockField()
    titleB: string;

    @ChildBlock(CBlock)
    c1: ExtractBlockData<typeof CBlock>;

    @ChildBlock(CBlock)
    c2: ExtractBlockData<typeof CBlock>;

    @BlockField()
    visibilityC1: boolean;

    searchText(): SearchText[] {
        return [this.titleB];
    }

    childBlocksInfo(): ChildBlockInfo[] {
        return [
            {
                visible: this.visibilityC1,
                relJsonPath: ["c1"],
                block: this.c1,
                name: CBlock.name,
            },
            {
                visible: true,
                relJsonPath: ["c2"],
                block: this.c2,
                name: CBlock.name,
            },
        ];
    }
}

class BBlockInput extends BlockInput {
    @IsString()
    @IsNotEmpty()
    @BlockField()
    titleB: string;

    @ChildBlockInput(CBlock)
    c1: ExtractBlockInput<typeof CBlock>;

    @ChildBlockInput(CBlock)
    c2: ExtractBlockInput<typeof CBlock>;

    @IsBoolean()
    @BlockField()
    visibilityC1: boolean;

    transformToBlockData(): BBlockData {
        return blockInputToData(BBlockData, this);
    }
}

export const BBlock = createBlock(BBlockData, BBlockInput, "BTestBlock");
