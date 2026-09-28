import type { ObjectQuery } from "@mikro-orm/core/typings";
import { AnyEntity, EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { filtersToMikroOrmQuery, gqlSortToMikroOrmOrderBy, searchToMikroOrmQuery } from "../common/filter/mikro-orm";
import { REQUIRED_PERMISSION_METADATA_KEY } from "../user-permissions/decorators/required-permission.decorator";
import { EntityActionLogsArgs } from "./dto/entity-action-logs.args";
import { PaginatedActionLogs } from "./dto/paginated-action-logs";
import { ActionLog } from "./entities/action-log.entity";

function classNameToInstanceName(className: string): string {
    return className[0].toLocaleLowerCase() + className.slice(1);
}

export class ActionLogsResolverFactory {
    static create<T extends AnyEntity>(classRef: Type<T>) {
        if (!Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, classRef)) {
            throw new Error(
                `ActionLogsModule.forFeature: ${classRef.name} is missing a @RequiredPermission decorator. Action log resolvers inherit the entity's permission via @Resolver(() => Entity).`,
            );
        }
        const listQueryName = `${classNameToInstanceName(classRef.name)}ActionLogs`;

        @Resolver(() => classRef)
        class ActionLogsResolver {
            constructor(readonly entityManager: EntityManager<PostgreSqlDriver>) {}

            @Query(() => PaginatedActionLogs, { name: listQueryName })
            async list(@Args() { scope, search, filter, offset, limit, sort }: EntityActionLogsArgs): Promise<PaginatedActionLogs> {
                const andFilters: ObjectQuery<ActionLog>[] = [{ entityName: classRef.name }];

                if (Object.keys(scope).length > 0) {
                    // Action log rows for entities without a scope have scope=NULL; match those too so
                    // unscoped entities still surface their logs when the page is rendered inside a scoped layout.
                    andFilters.push({ $or: [{ scope: null }, { scope: { $contains: [scope] } }] });
                }

                if (search) {
                    andFilters.push(searchToMikroOrmQuery(search, ["userId"]));
                }

                if (filter) {
                    andFilters.push(filtersToMikroOrmQuery(filter));
                }

                const [entities, totalCount] = await this.entityManager.findAndCount(
                    ActionLog,
                    { $and: andFilters },
                    {
                        offset,
                        limit,
                        orderBy: sort ? gqlSortToMikroOrmOrderBy(sort) : { createdAt: "DESC" },
                    },
                );
                return new PaginatedActionLogs(entities, totalCount);
            }
        }

        return ActionLogsResolver;
    }
}
