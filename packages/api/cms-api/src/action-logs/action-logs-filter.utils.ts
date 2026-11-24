import { type ObjectQuery, raw } from "@mikro-orm/postgresql";

import { filtersToMikroOrmQuery } from "../common/filter/mikro-orm.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import type { ActionLogFilter } from "./dto/action-log.filter.js";
import { ActionLogType } from "./dto/action-log-type.enum.js";
import type { ActionLog } from "./entities/action-log.entity.js";

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

    if (filter.type) {
        if (filter.type.equal != null) {
            andConditions.push(rowHasType(filter.type.equal));
        }
        if (filter.type.isAnyOf != null) {
            andConditions.push(filter.type.isAnyOf.length > 0 ? { $or: filter.type.isAnyOf.map(rowHasType) } : { id: { $in: [] } });
        }
        if (filter.type.notEqual != null) {
            andConditions.push({ $not: rowHasType(filter.type.notEqual) });
        }
    }

    const { scope: _scope, type: _type, and, or, ...rest } = filter;
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
 * The type isn't stored but derived from the snapshot and the version, the same way as the `type` field of the resolver.
 */
function rowHasType(type: ActionLogType): ObjectQuery<ActionLog> {
    switch (type) {
        case ActionLogType.deleted:
            return { snapshot: null };
        case ActionLogType.created:
            return { snapshot: { $ne: null }, version: 1 };
        case ActionLogType.updated:
            return { snapshot: { $ne: null }, version: { $ne: 1 } };
    }
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
