import {} from "class-validator";

import { IsPhoneNumber } from "../common/validators/is-phone-number";
import { IsUndefinable } from "../common/validators/is-undefinable";
import { BlockData, BlockInput, blockInputToData, createBlock } from "./block";
import { BlockField } from "./decorators/field";

class PhoneLinkBlockData extends BlockData {
    @BlockField({ nullable: true })
    phone?: string;
}

class PhoneLinkBlockInput extends BlockInput {
    @IsUndefinable()
    @IsPhoneNumber()
    @BlockField({ nullable: true })
    phone?: string;

    transformToBlockData(): PhoneLinkBlockData {
        return blockInputToData(PhoneLinkBlockData, this);
    }
}

export const PhoneLinkBlock = createBlock(PhoneLinkBlockData, PhoneLinkBlockInput, "PhoneLink");
