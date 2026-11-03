import { IsEmail, IsOptional } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "./block";
import { BlockField } from "./decorators/field";

class EmailLinkBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    email?: string | null;
}

class EmailLinkBlockInput extends BlockInput {
    @IsOptional()
    @IsEmail()
    @BlockField({ type: "string", nullable: true })
    email?: string | null;

    transformToBlockData(): EmailLinkBlockData {
        return blockInputToData(EmailLinkBlockData, this);
    }
}

export const EmailLinkBlock = createBlock(EmailLinkBlockData, EmailLinkBlockInput, "EmailLink");
