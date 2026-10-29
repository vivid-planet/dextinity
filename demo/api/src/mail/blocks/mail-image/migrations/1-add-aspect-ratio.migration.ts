import { BlockMigration, type BlockMigrationInterface } from "@dextinity/cms-api";

interface From {
    image: unknown;
    fullWidth: boolean;
}

interface To extends From {
    aspectRatio: string;
}

export class AddAspectRatioMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        return { ...from, aspectRatio: "16x9" };
    }
}
