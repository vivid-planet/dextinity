import type { ClassConstructor } from "class-transformer";

import type { BlockMigrationInterface, BlockMigrationVersionField, MigrateOptions, MigrateVendorOptions, VersionDataInterface } from "./types";

interface ApplyMigrationsOptions {
    migrations?: ClassConstructor<BlockMigrationInterface>[];
    blockName?: string;
    versionField?: BlockMigrationVersionField;
}

// Applies all Migration to a raw json-data from the database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMigrations<T = any>(
    rawData: T,
    { migrations: migrationClasses, blockName, versionField = "$$version" }: ApplyMigrationsOptions,
): T {
    if (!migrationClasses || migrationClasses.length < 1) {
        return rawData;
    }

    // Instantiate migration-classes
    const migrations = migrationClasses.map((c) => new c());

    // Wrong version numbers or wrong order of version numbers are catched here and
    function testMigrationsAreInSequence(migrations: BlockMigrationInterface[]): boolean {
        migrations.forEach((c, index) => {
            if (c.toVersion !== index + 1) {
                const chain = versionField === "$$vendorVersion" ? `the vendor migrations of Block ${blockName}` : `Block ${blockName}`;
                throw new Error(`The versionTo numbers in ${chain} are either not starting with 1, not ascending or not unique.`);
            }
        });

        return true;
    }

    testMigrationsAreInSequence(migrations);

    // Apply migrations
    return migrations.reduce((acc, migration) => (migration.supports(acc, versionField) ? migration.apply(acc, versionField) : acc), rawData);
}

export interface BlockMigrateOptions {
    migrate?: MigrateOptions;
    migrateVendor?: MigrateVendorOptions;
    blockName?: string;
}

// Applies the migrations shipped with the block before the block's own migrations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyBlockMigrations<T = any>(rawData: T, { migrate, migrateVendor, blockName }: BlockMigrateOptions): T {
    const data = splitLegacyVersion(rawData, migrateVendor?.legacyVersions);
    const vendorMigrated = applyMigrations(data, { migrations: migrateVendor?.migrations, blockName, versionField: "$$vendorVersion" });

    return applyMigrations(vendorMigrated, { migrations: migrate?.migrations, blockName });
}

// Migrations that moved into the vendor chain counted in `$$version` before the move, so block
// instances saved back then carry both chains in that one counter and have to be split up first
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function splitLegacyVersion<T = any>(rawData: T, legacyVersions?: number): T {
    if (legacyVersions === undefined || typeof rawData !== "object" || rawData === null) {
        return rawData;
    }

    const versionData = rawData as VersionDataInterface;
    if (versionData.$$vendorVersion !== undefined) {
        return rawData;
    }

    const { $$version: legacyVersion = 0, ...data } = versionData;
    const vendorVersion = Math.min(legacyVersion, legacyVersions);
    const version = legacyVersion - vendorVersion;

    // A counter of 0 is the same as no counter at all, and shouldn't end up in the saved block data
    return {
        ...data,
        ...(vendorVersion > 0 ? { $$vendorVersion: vendorVersion } : {}),
        ...(version > 0 ? { $$version: version } : {}),
    } as T;
}
