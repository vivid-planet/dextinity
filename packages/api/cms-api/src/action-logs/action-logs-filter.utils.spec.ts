import { RawQueryFragment } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { NumberFilter } from "../common/filter/number.filter";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { actionLogFilterToWhere } from "./action-logs-filter.utils";

// The key of a `raw()` condition holds a running index, so it's replaced by its parameters to compare whole queries.
function withReadableRawKeys(where: unknown): unknown {
    if (Array.isArray(where)) {
        return where.map(withReadableRawKeys);
    }
    if (where === null || typeof where !== "object") {
        return where;
    }
    return Object.fromEntries(
        Object.entries(where).map(([key, value]) => {
            const rawFragment = RawQueryFragment.getKnownFragment(key, false);
            return [rawFragment ? `raw(${rawFragment.params.join(", ")})` : key, withReadableRawKeys(value)];
        }),
    );
}

function exactScopeMatch(scope: ContentScope): string {
    return `raw(${JSON.stringify(scope)})`;
}

describe("actionLogFilterToWhere", () => {
    it("matches unscoped rows for isGlobal: true and scoped rows for isGlobal: false", () => {
        expect(actionLogFilterToWhere({ scope: { isGlobal: true } })).toEqual({ scope: null });
        expect(actionLogFilterToWhere({ scope: { isGlobal: false } })).toEqual({ scope: { $ne: null } });
    });

    it("requires a row to hold the requested scope exactly, in addition to the containment check", () => {
        expect(withReadableRawKeys(actionLogFilterToWhere({ scope: { equal: { domain: "main" } } }))).toEqual({
            scope: { $contains: [{ domain: "main" }] },
            [exactScopeMatch({ domain: "main" })]: true,
        });
    });

    it("negates the exact match for notEqual", () => {
        expect(withReadableRawKeys(actionLogFilterToWhere({ scope: { notEqual: { domain: "main" } } }))).toEqual({
            $not: {
                scope: { $contains: [{ domain: "main" }] },
                [exactScopeMatch({ domain: "main" })]: true,
            },
        });
    });

    it("matches any of the requested scopes for isAnyOf", () => {
        expect(withReadableRawKeys(actionLogFilterToWhere({ scope: { isAnyOf: [{ domain: "main" }, { domain: "secondary" }] } }))).toEqual({
            $or: [
                { scope: { $contains: [{ domain: "main" }] }, [exactScopeMatch({ domain: "main" })]: true },
                { scope: { $contains: [{ domain: "secondary" }] }, [exactScopeMatch({ domain: "secondary" })]: true },
            ],
        });
    });

    it("matches no rows for an empty isAnyOf, like the other isAnyOf filters", () => {
        expect(actionLogFilterToWhere({ scope: { isAnyOf: [] } })).toEqual({ id: { $in: [] } });
    });

    it("ignores scope filter fields that are null", () => {
        expect(actionLogFilterToWhere({ scope: { isAnyOf: null, equal: null, notEqual: null, isGlobal: null } })).toEqual({});
    });

    it("combines the scope filter with the other fields", () => {
        expect(actionLogFilterToWhere({ scope: { isGlobal: true }, version: Object.assign(new NumberFilter(), { equal: 1 }) })).toEqual({
            $and: [{ scope: null }, { version: { $eq: 1 } }],
        });
    });
});
