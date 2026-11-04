import { BlockMigration } from "../../../../blocks/migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../../../blocks/migrations/types";

interface From {
    damFileId?: string;
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
}

interface To extends From {
    previewImage: unknown;
}

export class AddPreviewImageMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(props: From): To {
        return { ...props, previewImage: {} };
    }
}
