import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";

interface From {
    youtubeIdentifier?: string;
    aspectRatio: unknown;
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
}

interface To {
    youtubeIdentifier?: string;
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
}

export class RemoveAspectRatioMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate({ aspectRatio, ...other }: From): To {
        return { ...other };
    }
}
