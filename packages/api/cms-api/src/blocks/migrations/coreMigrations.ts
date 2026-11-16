import type { ClassConstructor } from "class-transformer";

import { BlockMetaFieldKind } from "../block.js";
import { getBlockFieldData, getFieldKeys } from "../decorators/field.js";

type RawData = Record<string, unknown>;

// Migrations that apply to the data of every block, counted in `$$coreVersion`. They run after the block's
// own migrations, so they see the data in the shape of the current block data class.
type CoreMigration = (data: RawData, BlockData: ClassConstructor<unknown>) => RawData;

const coreMigrations: CoreMigration[] = [setMissingNullableFieldsToNull];

export const CORE_MIGRATIONS_VERSION = coreMigrations.length;

export function applyCoreMigrations<T>(rawData: T, BlockData: ClassConstructor<unknown>): T {
    if (typeof rawData !== "object" || rawData === null || Array.isArray(rawData)) {
        return rawData;
    }

    const data = rawData as RawData & { $$coreVersion?: number };
    const coreVersion = data.$$coreVersion ?? 0;

    if (coreVersion >= CORE_MIGRATIONS_VERSION) {
        return rawData;
    }

    const migrated = coreMigrations.slice(coreVersion).reduce((acc, migration) => migration(acc, BlockData), data as RawData);

    return { ...migrated, $$coreVersion: CORE_MIGRATIONS_VERSION } as T;
}

// Optional block fields used to be left out of the block data when they had no value. They are always present with `null` now.
function setMissingNullableFieldsToNull(data: RawData, BlockData: ClassConstructor<unknown>): RawData {
    const migrated: RawData = { ...data };

    for (const key of getFieldKeys(BlockData)) {
        const field = getBlockFieldData(BlockData, key);
        const value = migrated[key];

        if (value === undefined) {
            if (field.nullable) {
                migrated[key] = null;
            }
        } else if (field.kind === BlockMetaFieldKind.NestedObject && isRawData(value)) {
            migrated[key] = setMissingNullableFieldsToNull(value, field.object);
        } else if (field.kind === BlockMetaFieldKind.NestedObjectList && Array.isArray(value)) {
            migrated[key] = value.map((item) => (isRawData(item) ? setMissingNullableFieldsToNull(item, field.object) : item));
        }
    }

    return migrated;
}

function isRawData(value: unknown): value is RawData {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
