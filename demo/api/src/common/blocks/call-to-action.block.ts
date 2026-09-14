import {
    BlockData,
    BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    ExtractBlockInput,
} from "@dextinity/cms-api";
import { IsEnum } from "class-validator";

import { TextLinkBlock } from "./text-link.block";

export enum Variant {
    contained = "contained",
    outlined = "outlined",
    text = "text",
}

class CallToActionBlockData extends BlockData {
    @ChildBlock(TextLinkBlock)
    textLink: BlockDataInterface;

    @BlockField({ type: "enum", enum: Variant })
    variant: Variant;
}

class CallToActionBlockInput extends BlockInput {
    @ChildBlockInput(TextLinkBlock)
    textLink: ExtractBlockInput<typeof TextLinkBlock>;

    @IsEnum(Variant)
    @BlockField({ type: "enum", enum: Variant })
    variant: Variant;

    transformToBlockData(): CallToActionBlockData {
        return blockInputToData(CallToActionBlockData, this);
    }
}

export const CallToActionBlock = createBlock(CallToActionBlockData, CallToActionBlockInput, "CallToAction");
