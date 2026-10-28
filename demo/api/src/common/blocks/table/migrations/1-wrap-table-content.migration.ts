import { BlockMigration, type BlockMigrationInterface } from "@dextinity/cms-api";

type From = object;

interface To {
    table: From;
    responsiveBehavior: "scrollSideways";
}

export class WrapTableContentMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        return { table: from, responsiveBehavior: "scrollSideways" };
    }
}
