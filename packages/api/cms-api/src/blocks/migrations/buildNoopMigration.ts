import type { ClassConstructor } from "class-transformer";

import { BlockMigration } from "./BlockMigration";
import type { BlockMigrationInterface } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockData = Record<string, any>;

/**
 * A migration that changes nothing, holding a version a block doesn't use. A chain has to be
 * gapless, so without it the migrations after an optional one count differently per configuration -
 * and every migration added later would have to know which of the earlier ones a given
 * configuration switched on.
 */
export function buildNoopMigration(toVersion: number): ClassConstructor<BlockMigrationInterface> {
    return class NoopMigration extends BlockMigration<(from: BlockData) => BlockData> implements BlockMigrationInterface {
        public readonly toVersion = toVersion;

        protected migrate(from: BlockData): BlockData {
            return from;
        }
    };
}
