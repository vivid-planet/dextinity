import type { BlockMigrationTransformFn, BlockMigrationVersionField, From, To, VersionDataInterface } from "./types";

// Standard implementation with common boilerplate
// BlockMigrationInterface is not fully implemented in abstract class
// toVersion is missing
export abstract class BlockMigration<Fn extends BlockMigrationTransformFn = BlockMigrationTransformFn> {
    // Checks if the migration can be applied to the raw data given
    public supports(raw: From<Fn> & VersionDataInterface, versionField: BlockMigrationVersionField = "$$version"): boolean {
        if (!this.toVersion || this.toVersion < 1) {
            throw new Error("Migration has no toVersion defined"); // maybe dont throw error in supports
        }

        if (typeof raw !== "object") {
            return false; // only objects can be migrated
        }

        // Data that has not been migrated in this chain yet is at version 0,
        // so a migration applies exactly when the chain is one version below the one it migrates to
        return (raw[versionField] ?? 0) === this.toVersion - 1;
    }

    // Calls migrate, where the actual migration is implemented,
    // handles saving and increment of version numbers
    public apply(raw: From<Fn> & VersionDataInterface, versionField: BlockMigrationVersionField = "$$version"): To<Fn> & VersionDataInterface {
        const supported = this.supports(raw, versionField);

        if (!supported) {
            throw new Error("migration cannot be applied");
        }

        const { $$version, $$vendorVersion, ...rest } = raw;

        const result = this.migrate(rest as From<Fn>);
        const migrated = { ...result } as To<Fn> & VersionDataInterface;

        // The counter of the other chain has to survive this migration
        if ($$version !== undefined) {
            migrated.$$version = $$version;
        }
        if ($$vendorVersion !== undefined) {
            migrated.$$vendorVersion = $$vendorVersion;
        }
        migrated[versionField] = (raw[versionField] ?? 0) + 1;

        return migrated;
    }

    // Implement in final class
    protected abstract toVersion: number;

    // Implement in final class
    protected abstract migrate(raw: From<Fn>): To<Fn>;
}
