import type { ClassConstructor } from "class-transformer";

import { getBlockMigrationVersion, setBlockMigrationVersion } from "./blockMigrationVersion";
import type { BlockMigrationInterface, BlockMigrationScopeOptions, MigrateOptions, VersionDataInterface } from "./types";

interface ApplyMigrationsOptions {
    migrations?: ClassConstructor<BlockMigrationInterface>[];
    // useful as debug output
    blockName?: string;
    scope?: string;
}

// Applies all Migration to a raw json-data from the database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMigrations<T = any>(rawData: T, { migrations: migrationClasses, blockName, scope }: ApplyMigrationsOptions): T {
    if (!migrationClasses || migrationClasses.length < 1) {
        return rawData;
    }

    // Instantiate migration-classes
    const migrations = migrationClasses.map((c) => new c());

    // Wrong version numbers or wrong order of version numbers are catched here and
    function testMigrationsAreInSequence(migrations: BlockMigrationInterface[]): boolean {
        migrations.forEach((c, index) => {
            if (c.toVersion !== index + 1) {
                const chain = scope === undefined ? `Block ${blockName}` : `migration scope "${scope}" of Block ${blockName}`;
                throw new Error(`The versionTo numbers in ${chain} are either not starting with 1, not ascending or not unique.`);
            }
        });

        return true;
    }

    testMigrationsAreInSequence(migrations);

    // Apply migrations
    return migrations.reduce((acc, migration) => (migration.supports(acc, { scope }) ? migration.apply(acc, { scope }) : acc), rawData);
}

// Applies the block's own migrations, then those of each scope in the order the scopes were declared
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyBlockMigrations<T = any>(rawData: T, migrate: MigrateOptions, blockName?: string): T {
    let data = applyMigrations(rawData, { migrations: migrate.migrations, blockName });

    for (const [scope, scopeOptions] of Object.entries(migrate.scopes ?? {})) {
        data = applyMigrations(seedScopeVersion(data, scope, scopeOptions), { migrations: scopeOptions.migrations, blockName, scope });
    }

    return data;
}

// Data saved before a scope existed has no counter for it. `initialVersionFromLegacy` derives that
// counter from `$$version`, so migrations that moved into a scope are not applied a second time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function seedScopeVersion<T = any>(rawData: T, scope: string, { initialVersionFromLegacy }: BlockMigrationScopeOptions): T {
    if (initialVersionFromLegacy === undefined || typeof rawData !== "object" || rawData === null) {
        return rawData;
    }

    const versionData = rawData as VersionDataInterface;
    if (versionData.$$versions?.[scope] !== undefined) {
        return rawData;
    }

    return setBlockMigrationVersion(versionData, { version: initialVersionFromLegacy(getBlockMigrationVersion(versionData)), scope }) as T;
}
