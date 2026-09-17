import { getBlockMigrationVersion, setBlockMigrationVersion } from "./blockMigrationVersion";
import type { BlockMigrationContext, BlockMigrationTransformFn, From, To, VersionDataInterface } from "./types";

// Standard implementation with common boilerplate
// BlockMigrationInterface is not fully implemented in abstract class
// toVersion is missing
export abstract class BlockMigration<Fn extends BlockMigrationTransformFn = BlockMigrationTransformFn> {
    // Checks if the migration can be applied to the raw data given
    public supports(raw: From<Fn> & VersionDataInterface, context?: BlockMigrationContext): boolean {
        if (!this.toVersion || this.toVersion < 1) {
            throw new Error("Migration has no toVersion defined"); // maybe dont throw error in supports
        }

        if (typeof raw !== "object") {
            return false; // only objects can be migrated
        }

        // Data that was never migrated in this chain is at version 0, so a migration applies
        // exactly when the chain sits one version below the one it migrates to
        return getBlockMigrationVersion(raw, context?.scope) === this.toVersion - 1;
    }

    // Calls migrate, where the actual migration is implemented,
    // handles saving and increment of version numbers
    public apply(raw: From<Fn> & VersionDataInterface, context?: BlockMigrationContext): To<Fn> & VersionDataInterface {
        const supported = this.supports(raw, context);

        if (!supported) {
            throw new Error("migration cannot be applied");
        }

        const scope = context?.scope;
        const nextVersion = getBlockMigrationVersion(raw, scope) + 1;

        const { $$version, $$versions, ...rest } = raw;

        const result = this.migrate(rest as From<Fn>);

        // Counters of the other chains have to survive this migration
        const otherVersions: VersionDataInterface = {};
        if ($$version !== undefined) {
            otherVersions.$$version = $$version;
        }
        if ($$versions !== undefined) {
            otherVersions.$$versions = $$versions;
        }

        return setBlockMigrationVersion({ ...result, ...otherVersions }, { version: nextVersion, scope });
    }

    // Implement in final class
    protected abstract toVersion: number;

    // Implement in final class
    protected abstract migrate(raw: From<Fn>): To<Fn>;
}
