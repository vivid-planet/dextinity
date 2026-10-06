import type { ClassConstructor } from "class-transformer";

import type { BlockMigrationInterface } from "./types.js";

// Applies all Migration to a raw json-data from the database
// the argument `blockName` is useful as debug output
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMigrations<T = any>(rawData: T, migrationClasses?: ClassConstructor<BlockMigrationInterface>[], blockName?: string): T {
    if (!migrationClasses || migrationClasses.length < 1) {
        return rawData;
    }

    // Instantiate migration-classes
    const migrations = migrationClasses.map((c) => new c());

    // Wrong version numbers or wrong order of version numbers are catched here and
    function testMigrationsAreInSequence(migrations: BlockMigrationInterface[]): boolean {
        migrations.forEach((c, index) => {
            if (c.toVersion !== index + 1) {
                throw new Error(`The versionTo numbers in Block ${blockName} are either not starting with 1, not ascending or not unique.`);
            }
        });

        return true;
    }

    testMigrationsAreInSequence(migrations);

    // Apply migrations
    return migrations.reduce((acc, migration) => (migration.supports(acc) ? migration.apply(acc) : acc), rawData);
}
