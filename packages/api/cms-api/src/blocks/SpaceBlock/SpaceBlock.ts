import { IsInt, Max } from "class-validator";

// import { typeSafeBlockMigrationPipe } from "../../migrations/typeSafeBlockMigrationPipe";
import { BlockData, BlockInput, blockInputToData, createBlock } from "../block";
import { BlockField } from "../decorators/field";
// import { MigrationTo1 } from "./migrations/MigrationTo1";
// import { MigrationTo2 } from "./migrations/MigrationTo2";

class SpaceBlockData extends BlockData {
    @BlockField()
    height: number;
}

class SpaceBlockInput extends BlockInput {
    @Max(1000)
    @IsInt()
    @BlockField()
    height: number;

    transformToBlockData(): SpaceBlockData {
        return blockInputToData(SpaceBlockData, this);
    }
}

/** @deprecated The `SpaceBlock` is deprecated. It will be removed in the next major version. Use `createSpaceBlock` instead. */
export const SpaceBlock = createBlock(SpaceBlockData, SpaceBlockInput, {
    name: "Space",
    description: "Vertical space between two blocks, as a height in pixels.",
    // demoMigrations:
    // migrate: {
    //     migrations: typeSafeBlockMigrationPipe([MigrationTo1, MigrationTo2]),
    //     version: 2,
    // },
});
