import {
    type Block,
    BlockData,
    BlockDataInterface,
    BlockField,
    BlockInput,
    blockInputToData,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    ExtractBlockInput,
    typeSafeBlockMigrationPipe,
} from "@dextinity/cms-api";
import { IsEnum } from "class-validator";

import { WrapTableContentMigration } from "./migrations/1-wrap-table-content.migration";

export enum ResponsiveBehavior {
    scrollSideways = "scrollSideways",
    none = "none",
}

export function createTableBlockWithResponsiveBehavior({ tableContentBlock, name }: { tableContentBlock: Block; name: string }) {
    class TableBlockData extends BlockData {
        @ChildBlock(tableContentBlock)
        table: BlockDataInterface;

        @BlockField({ type: "enum", enum: ResponsiveBehavior })
        responsiveBehavior: ResponsiveBehavior;
    }

    class TableBlockInput extends BlockInput {
        @ChildBlockInput(tableContentBlock)
        table: ExtractBlockInput<typeof tableContentBlock>;

        @IsEnum(ResponsiveBehavior)
        @BlockField({ type: "enum", enum: ResponsiveBehavior })
        responsiveBehavior: ResponsiveBehavior;

        transformToBlockData(): TableBlockData {
            return blockInputToData(TableBlockData, this);
        }
    }

    return createBlock(TableBlockData, TableBlockInput, {
        name,
        migrate: {
            migrations: typeSafeBlockMigrationPipe([WrapTableContentMigration]),
            version: 1,
        },
    });
}
