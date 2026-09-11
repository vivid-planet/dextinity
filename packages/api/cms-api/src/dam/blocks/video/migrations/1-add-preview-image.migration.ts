import { BlockMigration } from "../../../../blocks/migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../../../blocks/migrations/types";

interface From {
    damFileId?: string;
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
    previewImage?: unknown;
}

type To = From;

export class AddPreviewImageMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(props: From): To {
        // Keep the preview image of data that has one but was never versioned.
        return { ...props, previewImage: props.previewImage ?? {} };
    }
}
