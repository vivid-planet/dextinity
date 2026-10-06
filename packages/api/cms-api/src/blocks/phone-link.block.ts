import { IsOptional } from "class-validator";

import { IsPhoneNumber } from "../common/validators/is-phone-number.js";
import { BlockData, BlockInput, blockInputToData, createBlock } from "./block.js";
import { BlockField } from "./decorators/field.js";

class PhoneLinkBlockData extends BlockData {
    @BlockField({ nullable: true })
    phone?: string;
}

class PhoneLinkBlockInput extends BlockInput {
    @IsOptional()
    @IsPhoneNumber()
    @BlockField({ nullable: true })
    phone?: string;

    transformToBlockData(): PhoneLinkBlockData {
        return blockInputToData(PhoneLinkBlockData, this);
    }
}

export const PhoneLinkBlock = createBlock(PhoneLinkBlockData, PhoneLinkBlockInput, "PhoneLink");
