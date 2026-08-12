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
import { TipTapTableBlock } from "@src/common/blocks/tip-tap-table.block";
import { IsEnum } from "class-validator";

/** How the table is rendered when it is wider than the page. */
export enum ResponsiveBehavior {
    horizontalScrolling = "horizontalScrolling",
}

class ResponsiveTableBlockData extends BlockData {
    @ChildBlock(TipTapTableBlock)
    table: BlockDataInterface;

    @BlockField({ type: "enum", enum: ResponsiveBehavior })
    responsiveBehavior: ResponsiveBehavior;
}

class ResponsiveTableBlockInput extends BlockInput {
    @ChildBlockInput(TipTapTableBlock)
    table: ExtractBlockInput<typeof TipTapTableBlock>;

    @IsEnum(ResponsiveBehavior)
    @BlockField({ type: "enum", enum: ResponsiveBehavior })
    responsiveBehavior: ResponsiveBehavior;

    transformToBlockData(): ResponsiveTableBlockData {
        return blockInputToData(ResponsiveTableBlockData, this);
    }
}

export const ResponsiveTableBlock = createBlock(ResponsiveTableBlockData, ResponsiveTableBlockInput, {
    name: "ResponsiveTable",
});
