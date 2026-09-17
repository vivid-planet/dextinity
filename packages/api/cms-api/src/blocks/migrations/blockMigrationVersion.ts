import type { MigrateOptions, VersionDataInterface } from "./types";

export function getBlockMigrationVersion(raw: VersionDataInterface, scope?: string): number {
    if (scope === undefined) {
        return raw.$$version ?? 0;
    }

    return raw.$$versions?.[scope] ?? 0;
}

export function setBlockMigrationVersion<T extends VersionDataInterface>(raw: T, { version, scope }: { version: number; scope?: string }): T {
    if (scope === undefined) {
        return { ...raw, $$version: version };
    }

    return { ...raw, $$versions: { ...raw.$$versions, [scope]: version } };
}

export function getScopeVersions(migrate: MigrateOptions): Record<string, number> {
    return Object.fromEntries(Object.entries(migrate.scopes ?? {}).map(([scope, { version }]) => [scope, version]));
}
