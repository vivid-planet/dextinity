import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockData = Record<string, any>;

/**
 * A migration that changes nothing, holding the version the DraftJS migration occupies for a block
 * that doesn't have it. The chain has to be gapless, so without it every migration added after that
 * one would have to know whether `migrateFromDraftJs` is configured to pick its own version.
 */
export function buildNoopMigration(toVersion: number): ClassConstructor<BlockMigrationInterface> {
    return class NoopMigration extends BlockMigration<(from: BlockData) => BlockData> implements BlockMigrationInterface {
        public readonly toVersion = toVersion;

        protected migrate(from: BlockData): BlockData {
            return from;
        }
    };
}
