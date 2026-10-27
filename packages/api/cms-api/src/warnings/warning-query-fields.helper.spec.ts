import type { EntityMetadata } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { BooleanFilter } from "../common/filter/boolean.filter";
import { gqlArgsToMikroOrmQuery } from "../common/filter/mikro-orm";
import { StringFilter } from "../common/filter/string.filter";
import { SortDirection } from "../common/sorting/sort-direction.enum";
import { WarningSort } from "./dto/warning.sort";
import { referencesEntityInfo, remapWarningOrderBy, remapWarningQueryFields } from "./warning-query-fields.helper";

function stringFilter(values: Partial<StringFilter>): StringFilter {
    return Object.assign(new StringFilter(), values);
}

function warningSort(field: WarningSort["field"], direction: SortDirection): WarningSort {
    return Object.assign(new WarningSort(), { field, direction });
}

describe("remapWarningQueryFields", () => {
    it("remaps name to the joined entityInfo alias", () => {
        expect(remapWarningQueryFields({ name: { $ilike: "%foo%" } })).toEqual({ "entityInfo.name": { $ilike: "%foo%" } });
    });

    it("remaps secondaryInformation to the joined entityInfo alias", () => {
        expect(remapWarningQueryFields({ secondaryInformation: { $eq: "foo" } })).toEqual({
            "entityInfo.secondaryInformation": { $eq: "foo" },
        });
    });

    it("remaps type to the sourceInfo JSONB path", () => {
        expect(remapWarningQueryFields({ type: { $eq: "Page" } })).toEqual({ sourceInfo: { rootEntityName: { $eq: "Page" } } });
    });

    it("remaps visible to the joined entityInfo alias, treating a missing EntityInfo as visible", () => {
        expect(remapWarningQueryFields({ visible: { $eq: true } })).toEqual({
            $and: [{ $or: [{ "entityInfo.visible": { $eq: true } }, { "entityInfo.visible": null }] }],
        });
    });

    it("remaps visible: false without matching a missing EntityInfo", () => {
        expect(remapWarningQueryFields({ visible: { $eq: false } })).toEqual({ $and: [{ "entityInfo.visible": { $eq: false } }] });
    });

    it("keeps existing $and / $or conditions next to a remapped visible", () => {
        const query = { visible: { $eq: false }, $and: [{ message: { $ilike: "%x%" } }], $or: [{ severity: { $eq: "high" } }] };
        expect(remapWarningQueryFields(query)).toEqual({
            $and: [{ message: { $ilike: "%x%" } }, { "entityInfo.visible": { $eq: false } }],
            $or: [{ severity: { $eq: "high" } }],
        });
    });

    it("leaves warning columns untouched", () => {
        const query = { message: { $ilike: "%x%" }, severity: { $eq: "high" }, status: { $in: ["open"] }, createdAt: { $gt: "2020" } };
        expect(remapWarningQueryFields(query)).toEqual(query);
    });

    it("remaps fields nested inside $and and $or", () => {
        const query = { $and: [{ type: { $eq: "Page" } }], $or: [{ name: { $ilike: "%a%" } }, { secondaryInformation: { $ilike: "%b%" } }] };
        expect(remapWarningQueryFields(query)).toEqual({
            $and: [{ sourceInfo: { rootEntityName: { $eq: "Page" } } }],
            $or: [{ "entityInfo.name": { $ilike: "%a%" } }, { "entityInfo.secondaryInformation": { $ilike: "%b%" } }],
        });
    });

    // Regression: "does not contain" produces a `$not`; the nested field must be remapped too, else
    // MikroORM throws "Trying to query by not existing property Warning.name".
    it("remaps fields nested inside $not", () => {
        expect(remapWarningQueryFields({ $not: { name: { $ilike: "%foo%" } } })).toEqual({
            $not: { "entityInfo.name": { $ilike: "%foo%" } },
        });
    });

    it("does not mutate the input", () => {
        const query = { name: { $ilike: "%foo%" } };
        remapWarningQueryFields(query);
        expect(query).toEqual({ name: { $ilike: "%foo%" } });
    });

    describe("integration with gqlArgsToMikroOrmQuery for every string operator", () => {
        const metadata = {} as EntityMetadata;
        const collectKeys = (value: unknown, keys: Set<string> = new Set()): Set<string> => {
            if (Array.isArray(value)) {
                value.forEach((item) => collectKeys(item, keys));
            } else if (value !== null && typeof value === "object") {
                for (const [key, nested] of Object.entries(value)) {
                    keys.add(key);
                    collectKeys(nested, keys);
                }
            }
            return keys;
        };

        const operators: Array<[string, Partial<StringFilter>]> = [
            ["contains", { contains: "x" }],
            ["notContains", { notContains: "x" }],
            ["equal", { equal: "x" }],
            ["notEqual", { notEqual: "x" }],
            ["startsWith", { startsWith: "x" }],
            ["endsWith", { endsWith: "x" }],
            ["startsWith+endsWith", { startsWith: "a", endsWith: "b" }],
            ["isEmpty", { isEmpty: true }],
            ["isNotEmpty", { isNotEmpty: true }],
            ["isAnyOf", { isAnyOf: ["a", "b"] }],
        ];

        it.each(operators)("remaps the name field away from Warning.name for operator %s", (_label, values) => {
            const filter = { and: [{ name: stringFilter(values) }] };
            const remapped = remapWarningQueryFields(gqlArgsToMikroOrmQuery({ filter }, metadata));
            const keys = collectKeys(remapped);

            // The bare `name` key (which MikroORM would reject on the Warning entity) must be gone,
            // replaced by the joined alias.
            expect(keys.has("name")).toBe(false);
            expect(keys.has("entityInfo.name")).toBe(true);
            expect(referencesEntityInfo(remapped)).toBe(true);
        });

        it("remaps the visible boolean filter away from Warning.visible", () => {
            const filter = { and: [{ visible: Object.assign(new BooleanFilter(), { equal: true }) }] };
            const remapped = remapWarningQueryFields(gqlArgsToMikroOrmQuery({ filter }, metadata));
            const keys = collectKeys(remapped);

            expect(keys.has("visible")).toBe(false);
            expect(keys.has("entityInfo.visible")).toBe(true);
            expect(referencesEntityInfo(remapped)).toBe(true);
        });
    });
});

describe("remapWarningOrderBy", () => {
    it("returns undefined when no sort is given", () => {
        expect(remapWarningOrderBy(undefined)).toBeUndefined();
    });

    it("sorts type by the sourceInfo JSONB path", () => {
        expect(remapWarningOrderBy([warningSort("type" as WarningSort["field"], SortDirection.ASC)])).toEqual([
            { sourceInfo: { rootEntityName: SortDirection.ASC } },
        ]);
    });

    it("sorts name by the joined entityInfo alias", () => {
        expect(remapWarningOrderBy([warningSort("name" as WarningSort["field"], SortDirection.DESC)])).toEqual([
            { "entityInfo.name": SortDirection.DESC },
        ]);
    });

    it("sorts visible by the joined entityInfo alias", () => {
        expect(remapWarningOrderBy([warningSort("visible" as WarningSort["field"], SortDirection.ASC)])).toEqual([
            { "entityInfo.visible": SortDirection.ASC },
        ]);
    });

    it("leaves plain warning columns untouched", () => {
        expect(remapWarningOrderBy([warningSort("createdAt" as WarningSort["field"], SortDirection.DESC)])).toEqual([
            { createdAt: SortDirection.DESC },
        ]);
    });

    it("maps each item of a multi-field sort", () => {
        const orderBy = remapWarningOrderBy([
            warningSort("type" as WarningSort["field"], SortDirection.ASC),
            warningSort("name" as WarningSort["field"], SortDirection.DESC),
            warningSort("severity" as WarningSort["field"], SortDirection.ASC),
        ]);
        expect(orderBy).toEqual([
            { sourceInfo: { rootEntityName: SortDirection.ASC } },
            { "entityInfo.name": SortDirection.DESC },
            { severity: SortDirection.ASC },
        ]);
    });

    it("produces an order-by that only triggers the EntityInfo join when sorting by name", () => {
        expect(referencesEntityInfo(remapWarningOrderBy([warningSort("name" as WarningSort["field"], SortDirection.ASC)]))).toBe(true);
        expect(referencesEntityInfo(remapWarningOrderBy([warningSort("type" as WarningSort["field"], SortDirection.ASC)]))).toBe(false);
        expect(referencesEntityInfo(remapWarningOrderBy([warningSort("createdAt" as WarningSort["field"], SortDirection.DESC)]))).toBe(false);
    });
});

describe("referencesEntityInfo", () => {
    it("is true when an entityInfo field is referenced", () => {
        expect(referencesEntityInfo({ "entityInfo.name": { $ilike: "%x%" } })).toBe(true);
    });

    it("is true when an entityInfo field is nested inside $and / $or / $not", () => {
        expect(referencesEntityInfo({ $and: [{ $not: { "entityInfo.secondaryInformation": { $ilike: "%x%" } } }] })).toBe(true);
        expect(referencesEntityInfo([{ "entityInfo.name": "ASC" }])).toBe(true);
    });

    it("is false for type / sourceInfo and plain warning columns", () => {
        expect(referencesEntityInfo({ sourceInfo: { rootEntityName: { $eq: "Page" } } })).toBe(false);
        expect(referencesEntityInfo({ message: { $ilike: "%x%" }, status: { $in: ["open"] } })).toBe(false);
        expect(referencesEntityInfo([{ createdAt: "DESC" }])).toBe(false);
    });

    it("is false for nullish values", () => {
        expect(referencesEntityInfo(undefined)).toBe(false);
        expect(referencesEntityInfo(null)).toBe(false);
    });
});
