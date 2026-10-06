import type { BlockMigrationTransformFn, From, To, VersionDataInterface } from "./types.js";

// Standard implementation with common boilerplate
// BlockMigrationInterface is not fully implemented in abstract class
// toVersion is missing
export abstract class BlockMigration<Fn extends BlockMigrationTransformFn = BlockMigrationTransformFn> {
    // Checks if the migration can be applied to the raw data given
    public supports(raw: From<Fn> & VersionDataInterface): boolean {
        if (!this.toVersion || this.toVersion < 1) {
            throw new Error("Migration has no toVersion defined"); // maybe dont throw error in supports
        }

        if (typeof raw !== "object") {
            return false; // only objects can be migrated
        }

        // toVersion with value 1 expects a previous version of undefined or 0
        if (this.toVersion === 1) {
            if (!("$$version" in (raw as object))) {
                return true;
            }
            if (raw.$$version === 0) {
                return true;
            }
        }
        // toVersion with value of > 1 expects a previous version one smaller
        if (this.toVersion > 1) {
            if ("$$version" in (raw as object) && raw.$$version === this.toVersion - 1) {
                return true;
            }
        }

        return false;
    }

    // Calls migrate, where the actual migration is implemented,
    // handles saving and increment of version numbers
    public apply(raw: From<Fn> & VersionDataInterface): To<Fn> & VersionDataInterface {
        const supported = this.supports(raw);

        if (!supported) {
            throw new Error("migration cannot be applied");
        }

        const { $$version: previousVersion, ...rest } = raw;
        const nextVersion = previousVersion === undefined ? 1 : previousVersion + 1;

        const result = this.migrate(rest as From<Fn>);

        const migrated: To<Fn> & VersionDataInterface = {
            ...result,
            $$version: nextVersion,
        };

        return migrated;
    }

    // Implement in final class
    protected abstract toVersion: number;

    // Implement in final class
    protected abstract migrate(raw: From<Fn>): To<Fn>;
}
