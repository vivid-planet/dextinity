import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";

interface From {
    youtubeIdentifier?: string;
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
}

interface To extends From {
    previewImage: unknown;
}

export class AddPreviewImageMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 2;

    protected migrate(props: From): To {
        return { ...props, previewImage: {} };
    }
}
