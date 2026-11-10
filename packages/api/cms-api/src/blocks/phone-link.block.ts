import { IsOptional } from "class-validator";

import { IsPhoneNumber } from "../common/validators/is-phone-number.js";
import { BlockData, BlockInput, blockInputToData, createBlock } from "./block.js";
import { BlockField } from "./decorators/field.js";

class PhoneLinkBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    phone?: string | null;
}

class PhoneLinkBlockInput extends BlockInput {
    @IsOptional()
    @IsPhoneNumber()
    @BlockField({ type: "string", nullable: true })
    phone?: string | null;

    transformToBlockData(): PhoneLinkBlockData {
        return blockInputToData(PhoneLinkBlockData, this);
    }
}

export const PhoneLinkBlock = createBlock(PhoneLinkBlockData, PhoneLinkBlockInput, "PhoneLink");
