import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";

interface From {
    targetUrl?: string;
    openInNewWindow: boolean;
}

interface To extends From {
    noFollow: boolean;
}

export class AddNoFollowMigration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(props: From): To {
        return { ...props, noFollow: false };
    }
}
