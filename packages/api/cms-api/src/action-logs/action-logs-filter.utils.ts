import type { ObjectQuery } from "@mikro-orm/postgresql";

import { filtersToMikroOrmQuery } from "../common/filter/mikro-orm";
import type { ActionLogFilter } from "./dto/action-log.filter";
import type { ActionLog } from "./entities/action-log.entity";

export function actionLogFilterToWhere(filter: ActionLogFilter): ObjectQuery<ActionLog> {
    const andConditions: ObjectQuery<ActionLog>[] = [];

    if (filter.scope) {
        if (filter.scope.isGlobal === true) {
            andConditions.push({ scope: null });
        }
        if (filter.scope.equal !== undefined) {
            andConditions.push({ scope: { $contains: [filter.scope.equal] } });
        }
        if (filter.scope.isAnyOf !== undefined && filter.scope.isAnyOf.length > 0) {
            andConditions.push({ $or: filter.scope.isAnyOf.map((scope) => ({ scope: { $contains: [scope] } })) });
        }
        if (filter.scope.notEqual !== undefined) {
            andConditions.push({ $not: { scope: { $contains: [filter.scope.notEqual] } } });
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
