import { IsString } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "../../blocks/block.js";
import { BlockField } from "../../blocks/decorators/field.js";
import { IsNullable } from "../../common/validators/is-nullable.js";

class AnchorBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    name: string | null;
}

class AnchorBlockInput extends BlockInput {
    @BlockField({ type: "string", nullable: true })
    @IsNullable()
    @IsString()
    name: string | null;

    transformToBlockData(): AnchorBlockData {
        return blockInputToData(AnchorBlockData, this);
    }
}

const AnchorBlock = createBlock(AnchorBlockData, AnchorBlockInput, "Anchor");

export { AnchorBlock };
