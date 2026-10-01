import { type ObjectQuery, raw } from "@mikro-orm/postgresql";

import { filtersToMikroOrmQuery } from "../common/filter/mikro-orm";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import type { ActionLogFilter } from "./dto/action-log.filter";
import type { ActionLog } from "./entities/action-log.entity";

export function actionLogFilterToWhere(filter: ActionLogFilter): ObjectQuery<ActionLog> {
    const andConditions: ObjectQuery<ActionLog>[] = [];

    if (filter.scope) {
        if (filter.scope.isGlobal != null) {
            andConditions.push({ scope: filter.scope.isGlobal ? null : { $ne: null } });
        }
        if (filter.scope.equal != null) {
            andConditions.push(rowHoldsScope(filter.scope.equal));
        }
        if (filter.scope.isAnyOf != null) {
            andConditions.push(filter.scope.isAnyOf.length > 0 ? { $or: filter.scope.isAnyOf.map(rowHoldsScope) } : { id: { $in: [] } });
        }
        if (filter.scope.notEqual != null) {
            andConditions.push({ $not: rowHoldsScope(filter.scope.notEqual) });
        }
    }

    const { scope: _scope, and, or, ...rest } = filter;
    if (Object.keys(rest).length > 0) {
        andConditions.push(filtersToMikroOrmQuery(rest));
    }

    if (and && and.length > 0) {
        andConditions.push({ $and: and.map(actionLogFilterToWhere) });
    }
    if (or && or.length > 0) {
        andConditions.push({ $or: or.map(actionLogFilterToWhere) });
    }

    if (andConditions.length === 0) {
        return {};
    }
    if (andConditions.length === 1) {
        return andConditions[0];
    }
    return { $and: andConditions };
}

/**
 * `$contains` alone would also match a row that holds a scope with more dimensions, for instance `main/de` for
 * `{ domain: "main" }`. It stays in the query for the GIN index.
 */
function rowHoldsScope(scope: ContentScope): ObjectQuery<ActionLog> {
    return {
        scope: { $contains: [scope] },
        [raw(
            (alias) => `exists (select 1 from jsonb_array_elements(${alias}."scope") as "rowScope" where "rowScope" = ?::jsonb)`,
            [JSON.stringify(scope)],
        )]: true,
    };
}
