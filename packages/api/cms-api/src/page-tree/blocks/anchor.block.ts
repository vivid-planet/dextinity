import { IsString } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "../../blocks/block";
import { BlockField } from "../../blocks/decorators/field";
import { IsUndefinable } from "../../common/validators/is-undefinable";

class AnchorBlockData extends BlockData {
    @BlockField({ nullable: true })
    name?: string;
}

class AnchorBlockInput extends BlockInput {
    @BlockField({ nullable: true })
    @IsUndefinable()
    @IsString()
    name?: string;

    transformToBlockData(): AnchorBlockData {
        return blockInputToData(AnchorBlockData, this);
    }
}

const AnchorBlock = createBlock(AnchorBlockData, AnchorBlockInput, "Anchor");

export { AnchorBlock };
