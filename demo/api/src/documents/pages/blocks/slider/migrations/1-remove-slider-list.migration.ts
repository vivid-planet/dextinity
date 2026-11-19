import { BlockMigration, type BlockMigrationInterface } from "@dextinity/cms-api";

interface From {
    sliderList: { blocks: unknown[] };
}

interface To {
    blocks: unknown[];
}

export class RemoveSliderListMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        return { blocks: from.sliderList.blocks };
    }
}
