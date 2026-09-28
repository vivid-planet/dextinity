import {
    BlockData,
    type BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    ExternalLinkBlock,
    type ExtractBlockInput,
} from "@dextinity/cms-api";
import { IsEnum, IsString } from "class-validator";

export enum MailButtonVariant {
    filled = "filled",
    outlined = "outlined",
}

export enum MailButtonAlignment {
    left = "left",
    center = "center",
    right = "right",
}

class MailButtonBlockData extends BlockData {
    @BlockField()
    text: string;

    @ChildBlock(ExternalLinkBlock)
    link: BlockDataInterface;

    @BlockField({ type: "enum", enum: MailButtonVariant })
    variant: MailButtonVariant;

    @BlockField({ type: "enum", enum: MailButtonAlignment })
    align: MailButtonAlignment;
}

class MailButtonBlockInput extends BlockInput {
    @BlockField()
    @IsString()
    text: string;

    @ChildBlockInput(ExternalLinkBlock)
    link: ExtractBlockInput<typeof ExternalLinkBlock>;

    @BlockField({ type: "enum", enum: MailButtonVariant })
    @IsEnum(MailButtonVariant)
    variant: MailButtonVariant;

    @BlockField({ type: "enum", enum: MailButtonAlignment })
    @IsEnum(MailButtonAlignment)
    align: MailButtonAlignment;

    transformToBlockData(): MailButtonBlockData {
        return blockInputToData(MailButtonBlockData, this);
    }
}

export const MailButtonBlock = createBlock(MailButtonBlockData, MailButtonBlockInput, "MailButton");
