import { IsEmail } from "class-validator";

import { IsUndefinable } from "../common/validators/is-undefinable";
import { BlockData, BlockInput, blockInputToData, createBlock } from "./block";
import { BlockField } from "./decorators/field";

class EmailLinkBlockData extends BlockData {
    @BlockField({ nullable: true })
    email?: string;
}

class EmailLinkBlockInput extends BlockInput {
    @IsUndefinable()
    @IsEmail()
    @BlockField({ nullable: true })
    email?: string;

    transformToBlockData(): EmailLinkBlockData {
        return blockInputToData(EmailLinkBlockData, this);
    }
}

export const EmailLinkBlock = createBlock(EmailLinkBlockData, EmailLinkBlockInput, "EmailLink");
