import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository, FindOptions } from "@mikro-orm/postgresql";
import { UnauthorizedException } from "@nestjs/common";
import { Args, ID, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { GetCurrentUser } from "../auth/decorators/get-current-user.decorator";
import { EntityInfoObject } from "../common/entityInfo/entity-info.object";
import { EntityInfoService } from "../common/entityInfo/entity-info.service";
import { gqlArgsToMikroOrmQuery } from "../common/filter/mikro-orm";
import { isScopeWithin } from "../user-permissions/access-control.service";
import { AffectedEntity } from "../user-permissions/decorators/affected-entity.decorator";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { PaginatedWarnings } from "./dto/paginated-warnings";
import { WarningsArgs } from "./dto/warnings.args";
import { Warning } from "./entities/warning.entity";

@Resolver(() => Warning)
@RequiredPermission(["warnings"], { skipScopeCheck: true })
export class WarningResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly entityInfoService: EntityInfoService,
        @InjectRepository(Warning) private readonly repository: EntityRepository<Warning>,
    ) {}

    @Query(() => Warning)
    @AffectedEntity(Warning)
    async warning(@Args("id", { type: () => ID }) id: string): Promise<Warning> {
        const warning = await this.repository.findOneOrFail(id);
        return warning;
    }

    @Query(() => PaginatedWarnings)
    async warnings(
        @Args() { status, search, filter, scopes, sort, offset, limit }: WarningsArgs,
        @GetCurrentUser() user: CurrentUser,
    ): Promise<PaginatedWarnings> {
        // check if there are any scopes that the user does not have permission to
        const allowedScopesForUser = user.permissions.find(({ permission }) => permission === "warnings")?.contentScopes;

        for (const scope of scopes) {
            if (!allowedScopesForUser?.some((allowedScope) => isScopeWithin(scope, allowedScope))) {
                throw new UnauthorizedException("Scopes were passed that the user does not have permission to");
            }
        }

        const standardFilter = filter;
        const scope = filter?.and?.find((item) => item.scope !== undefined)?.scope;

        if (filter?.and) {
            filter.and = filter.and.filter((item) => item.scope === undefined);
        }

        const where = gqlArgsToMikroOrmQuery({ search, filter: standardFilter }, this.entityManager.getMetadata(Warning));
        where.status = { $in: status };

        // A scope can be for example { domain: "main", language: "en" } but it should also query scopes that are only { domain: "main" }.
        // These additional scopes are calculated here.
        const additionalScopes: ContentScope[] = [];

        const keyValueMap: Record<string, Set<string | number>> = {};
        for (const scope of scopes) {
            for (const key of Object.keys(scope)) {
                if (!keyValueMap[key]) {
                    keyValueMap[key] = new Set();
                }
                keyValueMap[key].add(scope[key as keyof ContentScope]);
            }
        }
        for (const key of Object.keys(keyValueMap)) {
            for (const value of keyValueMap[key]) {
                additionalScopes.push({ [key]: value });
            }
        }
        const allowedScopes = scopes.concat(additionalScopes);

        where.$or = [{ scope: { $in: allowedScopes } }, { scope: { $eq: null } }];
        if (scope) {
            where.$and = where.$and || [];
            if (scope?.equal) {
                const scopeEqual = scope.equal;
                where.$and.push({ scope: { $eq: scopeEqual } });
            } else if (scope.notEqual) {
                where.$and.push({ scope: { $ne: scope.notEqual } });
            } else if (scope.isAnyOf) {
                where.$and.push({ scope: { $in: scope.isAnyOf } });
            }
        }

        const options: FindOptions<Warning> = { offset, limit };

        if (sort) {
            options.orderBy = sort.map((sortItem) => {
                return {
                    [sortItem.field]: sortItem.direction,
                };
            });
        }

        const [entities, totalCount] = await this.repository.findAndCount(where, options);
        return new PaginatedWarnings(entities, totalCount);
    }

    @ResolveField(() => EntityInfoObject, { nullable: true })
    async entityInfo(@Parent() warning: Warning): Promise<EntityInfoObject | undefined> {
        const repository = this.entityManager.getRepository(warning.sourceInfo.rootEntityName);
        const instance = await repository.findOne({ [warning.sourceInfo.rootPrimaryKey]: warning.sourceInfo.targetId });

        if (instance) {
            const entityInfo = await this.entityInfoService.getEntityInfo(instance);
            return entityInfo;
        }

        return undefined;
    }
}
