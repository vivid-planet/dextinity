import { BlockData, BlockField, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsEnum } from "class-validator";

export enum MailSpacing {
    small = "small",
    medium = "medium",
    large = "large",
}

class MailSpacerBlockData extends BlockData {
    @BlockField({ type: "enum", enum: MailSpacing })
    spacing: MailSpacing;
}

class MailSpacerBlockInput extends BlockInput {
    @BlockField({ type: "enum", enum: MailSpacing })
    @IsEnum(MailSpacing)
    spacing: MailSpacing;

    transformToBlockData(): MailSpacerBlockData {
        return blockInputToData(MailSpacerBlockData, this);
    }
}

export const MailSpacerBlock = createBlock(MailSpacerBlockData, MailSpacerBlockInput, "MailSpacer");
