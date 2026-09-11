import type { ObjectQuery } from "@mikro-orm/postgresql";

import type { WarningSort } from "./dto/warning.sort";
import type { Warning } from "./entities/warning.entity";

// Remapped warning query: `entityInfo.*` are join aliases from the EntityInfo view, not Warning columns.
export type WarningQuery = ObjectQuery<Warning & Record<`entityInfo.${"name" | "secondaryInformation"}`, string>>;

// `type`, `name` and `secondaryInformation` aren't plain Warning columns: `type` lives in the
// `sourceInfo` JSONB column, `name` / `secondaryInformation` in the joined EntityInfo view. These
// helpers remap them to the right column / join alias.

export function remapWarningQueryFields(query: unknown): unknown {
    if (Array.isArray(query)) {
        return query.map(remapWarningQueryFields);
    }
    if (query !== null && typeof query === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(query)) {
            // Recurse into every value so nested fields (inside `$and` / `$or` / `$not`) are remapped too.
            const remappedValue = remapWarningQueryFields(value);
            if (key === "type") {
                result.sourceInfo = { rootEntityName: remappedValue };
            } else if (key === "name") {
                result["entityInfo.name"] = remappedValue;
            } else if (key === "secondaryInformation") {
                result["entityInfo.secondaryInformation"] = remappedValue;
            } else {
                result[key] = remappedValue;
            }
        }
        return result;
    }
    return query;
}

// Translate WarningSort into a MikroORM order-by: `type` → `sourceInfo` JSONB, `name` → EntityInfo
// view, everything else → plain Warning column.
export function remapWarningOrderBy(sort?: WarningSort[]) {
    return sort?.map((sortItem) => {
        if (sortItem.field === "type") {
            return { sourceInfo: { rootEntityName: sortItem.direction } };
        }
        if (sortItem.field === "name") {
            return { "entityInfo.name": sortItem.direction };
        }
        return { [sortItem.field]: sortItem.direction };
    });
}

// Whether a where clause or order-by references the EntityInfo view, so the join is only added when
// name / secondary information require it (type reads from `sourceInfo` and needs no join).
export function referencesEntityInfo(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.some(referencesEntityInfo);
    }
    if (value !== null && typeof value === "object") {
        return Object.entries(value).some(([key, nestedValue]) => key.startsWith("entityInfo.") || referencesEntityInfo(nestedValue));
    }
    return false;
}
