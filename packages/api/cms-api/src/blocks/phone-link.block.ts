import { IsOptional } from "class-validator";

import { IsPhoneNumber } from "../common/validators/is-phone-number";
import { BlockData, BlockInput, blockInputToData, createBlock } from "./block";
import { BlockField } from "./decorators/field";

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

export const PhoneLinkBlock = createBlock(PhoneLinkBlockData, PhoneLinkBlockInput, {
    name: "PhoneLink",
    description: "A link that dials the given phone number.",
});
