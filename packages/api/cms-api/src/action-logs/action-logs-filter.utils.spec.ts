import { describe, expect, it } from "vitest";

import { NumberFilter } from "../common/filter/number.filter";
import { actionLogFilterToWhere } from "./action-logs-filter.utils";

describe("actionLogFilterToWhere", () => {
    it("matches unscoped rows for isGlobal: true and scoped rows for isGlobal: false", () => {
        expect(actionLogFilterToWhere({ scope: { isGlobal: true } })).toEqual({ scope: null });
        expect(actionLogFilterToWhere({ scope: { isGlobal: false } })).toEqual({ scope: { $ne: null } });
    });

    it("requires a row to hold the requested scope exactly, in addition to the containment check", () => {
        const where = actionLogFilterToWhere({ scope: { equal: { domain: "main" } } }) as Record<string, unknown>;

        expect(where.scope).toEqual({ $contains: [{ domain: "main" }] });
        expect(Object.keys(where)).toHaveLength(2);
    });

    it("negates the exact match for notEqual", () => {
        const where = actionLogFilterToWhere({ scope: { notEqual: { domain: "main" } } }) as { $not: Record<string, unknown> };

        expect(where.$not.scope).toEqual({ $contains: [{ domain: "main" }] });
    });

    it("matches any of the requested scopes for isAnyOf", () => {
        const where = actionLogFilterToWhere({ scope: { isAnyOf: [{ domain: "main" }, { domain: "secondary" }] } }) as { $or: unknown[] };

        expect(where.$or).toHaveLength(2);
    });

    it("matches no rows for an empty isAnyOf, like the other isAnyOf filters", () => {
        expect(actionLogFilterToWhere({ scope: { isAnyOf: [] } })).toEqual({ id: { $in: [] } });
    });

    it("ignores scope filter fields that are null", () => {
        expect(actionLogFilterToWhere({ scope: { isAnyOf: null, equal: null, notEqual: null, isGlobal: null } })).toEqual({});
    });

    it("combines the scope filter with the other fields", () => {
        const where = actionLogFilterToWhere({ scope: { isGlobal: true }, version: Object.assign(new NumberFilter(), { equal: 1 }) }) as {
            $and: unknown[];
        };

        expect(where.$and).toHaveLength(2);
    });
});
