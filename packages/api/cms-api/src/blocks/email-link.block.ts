import { IsEmail, IsOptional } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "./block.js";
import { BlockField } from "./decorators/field.js";

class EmailLinkBlockData extends BlockData {
    @BlockField({ nullable: true })
    email?: string;
}

class EmailLinkBlockInput extends BlockInput {
    @IsOptional()
    @IsEmail()
    @BlockField({ nullable: true })
    email?: string;

    transformToBlockData(): EmailLinkBlockData {
        return blockInputToData(EmailLinkBlockData, this);
    }
}

export const EmailLinkBlock = createBlock(EmailLinkBlockData, EmailLinkBlockInput, "EmailLink");
