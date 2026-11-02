import { IsOptional, IsString, Matches } from "class-validator";

import { BaseVideoBlockData, BaseVideoBlockInput } from "./base-video-block";
import { BlockDataInterface, blockInputToData, createBlock } from "./block";
import { BlockField } from "./decorators/field";

class VimeoVideoBlockData extends BaseVideoBlockData {
    @BlockField({ type: "string", nullable: true })
    vimeoIdentifier?: string | null;
}

class VimeoVideoBlockInput extends BaseVideoBlockInput {
    @IsOptional()
    @IsString()
    @Matches(/^(https?:\/\/)?((www\.|player\.)?vimeo\.com\/?(showcase\/)*([0-9a-z]*\/)*([0-9]{6,11})[?]?.*)$|^([0-9]{6,11})$/)
    @BlockField({ type: "string", nullable: true })
    vimeoIdentifier?: string | null;

    transformToBlockData(): BlockDataInterface {
        return blockInputToData(VimeoVideoBlockData, this);
    }
}

export const VimeoVideoBlock = createBlock(VimeoVideoBlockData, VimeoVideoBlockInput, "VimeoVideo");
