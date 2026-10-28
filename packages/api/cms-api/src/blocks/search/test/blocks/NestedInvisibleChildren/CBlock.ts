import { IsNotEmpty, IsString } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "../../../../block.js";
import { BlockField } from "../../../../decorators/field.js";
import type { SearchText } from "../../../get-search-text.js";

class CBlockData extends BlockData {
    @BlockField()
    titleC: string;

    searchText(): SearchText[] {
        return [this.titleC];
    }
}

class CBlockInput extends BlockInput {
    @IsString()
    @IsNotEmpty()
    @BlockField()
    titleC: string;

    transformToBlockData(): CBlockData {
        return blockInputToData(CBlockData, this);
    }
}

export const CBlock = createBlock(CBlockData, CBlockInput, "CTestBlock");
