import {
    BlockData,
    type BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    type ExtractBlockInput,
    PixelImageBlock,
    typeSafeBlockMigrationPipe,
} from "@dextinity/cms-api";
import { IsBoolean, IsEnum } from "class-validator";

import { AddAspectRatioMigration } from "./mail-image/migrations/1-add-aspect-ratio.migration";

export enum MailImageAspectRatio {
    "21x9" = "21x9",
    "16x9" = "16x9",
    "4x3" = "4x3",
    "2x1" = "2x1",
    "1x1" = "1x1",
    "3x4" = "3x4",
}

class MailImageBlockData extends BlockData {
    @ChildBlock(PixelImageBlock)
    image: BlockDataInterface;

    @BlockField()
    fullWidth: boolean;

    @BlockField({ type: "enum", enum: MailImageAspectRatio })
    aspectRatio: MailImageAspectRatio;
}

class MailImageBlockInput extends BlockInput {
    @ChildBlockInput(PixelImageBlock)
    image: ExtractBlockInput<typeof PixelImageBlock>;

    @BlockField()
    @IsBoolean()
    fullWidth: boolean;

    @BlockField({ type: "enum", enum: MailImageAspectRatio })
    @IsEnum(MailImageAspectRatio)
    aspectRatio: MailImageAspectRatio;

    transformToBlockData(): MailImageBlockData {
        return blockInputToData(MailImageBlockData, this);
    }
}

export const MailImageBlock = createBlock(MailImageBlockData, MailImageBlockInput, {
    name: "MailImage",
    migrate: {
        migrations: typeSafeBlockMigrationPipe([AddAspectRatioMigration]),
        version: 1,
    },
});
