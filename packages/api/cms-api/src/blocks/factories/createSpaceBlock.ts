import { IsEnum } from "class-validator";

import {
    type Block,
    BlockData,
    type BlockDataInterface,
    BlockInput,
    blockInputToData,
    createBlock,
    type SimpleBlockInputInterface,
} from "../block.js";
import { BlockField } from "../decorators/field.js";
import type { BlockFactoryNameOrOptions } from "./types.js";

interface CreateSpaceBlockOptions<SpacingOptions extends string[] | Record<string, string>> {
    spacing: SpacingOptions;
}

type SingleEnumType<SpacingOptions extends string[] | Record<string, string>> = SpacingOptions extends string[]
    ? SpacingOptions[number]
    : keyof SpacingOptions;

interface SpaceBlockInputInterface<SpacingOptions extends string[] | Record<string, string>> extends SimpleBlockInputInterface {
    spacing: SingleEnumType<SpacingOptions>;
}

export function createSpaceBlock<SpacingOptions extends string[] | Record<string, string>>(
    { spacing: Spacing }: CreateSpaceBlockOptions<SpacingOptions>,
    nameOrOptions: BlockFactoryNameOrOptions = "Space",
): Block<BlockDataInterface, SpaceBlockInputInterface<SpacingOptions>> {
    class SpaceBlockData extends BlockData {
        @BlockField({ type: "enum", enum: Spacing })
        spacing: SingleEnumType<SpacingOptions>;
    }

    class SpaceBlockInput extends BlockInput {
        @IsEnum(Spacing)
        @BlockField({ type: "enum", enum: Spacing })
        spacing: SingleEnumType<SpacingOptions>;

        transformToBlockData(): SpaceBlockData {
            return blockInputToData(SpaceBlockData, this);
        }
    }

    return createBlock(SpaceBlockData, SpaceBlockInput, nameOrOptions);
}
