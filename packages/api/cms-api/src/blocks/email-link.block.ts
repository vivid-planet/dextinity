import { IsEmail, IsOptional } from "class-validator";

import { BlockData, BlockInput, blockInputToData, createBlock } from "./block";
import { BlockField } from "./decorators/field";

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

export const EmailLinkBlock = createBlock(EmailLinkBlockData, EmailLinkBlockInput, {
    name: "EmailLink",
    description: "A link that opens a new email to the given address.",
});
