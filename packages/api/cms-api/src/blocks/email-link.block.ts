import { IsEmail } from "class-validator";

import { IsNullable } from "../common/validators/is-nullable.js";
import { BlockData, BlockInput, blockInputToData, createBlock } from "./block.js";
import { BlockField } from "./decorators/field.js";

class EmailLinkBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    email: string | null;
}

class EmailLinkBlockInput extends BlockInput {
    @IsNullable()
    @IsEmail()
    @BlockField({ type: "string", nullable: true })
    email: string | null;

    transformToBlockData(): EmailLinkBlockData {
        return blockInputToData(EmailLinkBlockData, this);
    }
}

export const EmailLinkBlock = createBlock(EmailLinkBlockData, EmailLinkBlockInput, "EmailLink");
