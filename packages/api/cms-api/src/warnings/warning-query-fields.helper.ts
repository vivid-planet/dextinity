import type { ObjectQuery } from "@mikro-orm/postgresql";

import type { WarningSort } from "./dto/warning.sort";
import type { Warning } from "./entities/warning.entity";

// Remapped warning query: `entityInfo.*` are join aliases from the EntityInfo view, not Warning columns.
export type WarningQuery = ObjectQuery<
    Warning & Record<`entityInfo.${"name" | "secondaryInformation"}`, string> & Record<"entityInfo.visible", boolean>
>;

// `type`, `name`, `secondaryInformation` and `visible` aren't plain Warning columns: `type` lives in the
// `sourceInfo` JSONB column, the others in the joined EntityInfo view. These helpers remap them to the
// right column / join alias.

export function remapWarningQueryFields(query: unknown): unknown {
    if (Array.isArray(query)) {
        return query.map(remapWarningQueryFields);
    }
    if (query !== null && typeof query === "object") {
        const result: Record<string, unknown> = {};
        let visibleCondition: Record<string, unknown> | undefined;
        for (const [key, value] of Object.entries(query)) {
            // Recurse into every value so nested fields (inside `$and` / `$or` / `$not`) are remapped too.
            const remappedValue = remapWarningQueryFields(value);
            if (key === "type") {
                result.sourceInfo = { rootEntityName: remappedValue };
            } else if (key === "name") {
                result["entityInfo.name"] = remappedValue;
            } else if (key === "secondaryInformation") {
                result["entityInfo.secondaryInformation"] = remappedValue;
            } else if (key === "visible") {
                visibleCondition = remapVisibleCondition(remappedValue);
            } else {
                result[key] = remappedValue;
            }
        }
        if (visibleCondition) {
            // Added to `$and` so it can't collide with an `$or` of the same query level.
            result.$and = [...((result.$and as unknown[] | undefined) ?? []), visibleCondition];
        }
        return result;
    }
    return query;
}

// Warnings of entities without an EntityInfo row (e.g. missing `@EntityInfo` decorator) count as visible,
// consistent with the dependencies view. Otherwise they'd silently disappear from the default-filtered grid.
function remapVisibleCondition(value: unknown): Record<string, unknown> {
    const condition = { "entityInfo.visible": value };
    const matchesVisible = (value as { $eq?: boolean } | undefined)?.$eq === true;
    return matchesVisible ? { $or: [condition, { "entityInfo.visible": null }] } : condition;
}

// Translate WarningSort into a MikroORM order-by: `type` → `sourceInfo` JSONB, `name` / `visible` →
// EntityInfo view, everything else → plain Warning column.
export function remapWarningOrderBy(sort?: WarningSort[]) {
    return sort?.map((sortItem) => {
        if (sortItem.field === "type") {
            return { sourceInfo: { rootEntityName: sortItem.direction } };
        }
        if (sortItem.field === "name") {
            return { "entityInfo.name": sortItem.direction };
        }
        if (sortItem.field === "visible") {
            return { "entityInfo.visible": sortItem.direction };
        }
        return { [sortItem.field]: sortItem.direction };
    });
}

// Whether a where clause or order-by references the EntityInfo view, so the join is only added when
// name / secondary information / visible require it (type reads from `sourceInfo` and needs no join).
export function referencesEntityInfo(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.some(referencesEntityInfo);
    }
    if (value !== null && typeof value === "object") {
        return Object.entries(value).some(([key, nestedValue]) => key.startsWith("entityInfo.") || referencesEntityInfo(nestedValue));
    }
    return false;
}
