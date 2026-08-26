import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository, raw } from "@mikro-orm/postgresql";
import { UnauthorizedException } from "@nestjs/common";
import { Args, ID, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import isEqual from "lodash.isequal";

import { GetCurrentUser } from "../auth/decorators/get-current-user.decorator";
import { gqlArgsToMikroOrmQuery, splitSearchString } from "../common/filter/mikro-orm";
import { EntityInfoObject } from "../entity-info/entity-info.object";
import { EntityInfoService } from "../entity-info/entity-info.service";
import { AffectedEntity } from "../user-permissions/decorators/affected-entity.decorator";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { PaginatedWarnings } from "./dto/paginated-warnings";
import { WarningsArgs } from "./dto/warnings.args";
import { Warning } from "./entities/warning.entity";
import { referencesEntityInfo, remapWarningOrderBy, remapWarningQueryFields, type WarningQuery } from "./warning-query-fields.helper";

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
            if (!allowedScopesForUser?.find((allowedScope) => isEqual(allowedScope, scope))) {
                throw new UnauthorizedException("Scopes were passed that the user does not have permission to");
            }
        }

        const standardFilter = filter;
        const scope = filter?.and?.find((item) => item.scope !== undefined)?.scope;

        if (filter?.and) {
            filter.and = filter.and.filter((item) => item.scope === undefined);
        }

        const where = remapWarningQueryFields(
            gqlArgsToMikroOrmQuery({ filter: standardFilter }, this.entityManager.getMetadata(Warning)),
        ) as WarningQuery;
        where.status = { $in: status };

        // Built by hand rather than via `gqlArgsToMikroOrmQuery`'s metadata-derived search, because name /
        // secondary information aren't Warning columns but come from the joined EntityInfo view.
        if (search) {
            where.$and = where.$and ?? [];
            for (const searchPart of splitSearchString(search)) {
                where.$and.push({
                    $or: [
                        { message: { $ilike: searchPart } },
                        { sourceInfo: { rootEntityName: { $ilike: searchPart } } },
                        { "entityInfo.name": { $ilike: searchPart } },
                        { "entityInfo.secondaryInformation": { $ilike: searchPart } },
                    ],
                });
            }
        }

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

        const orderBy = remapWarningOrderBy(sort);

        const queryBuilder = this.entityManager.createQueryBuilder(Warning, "warning").select("warning.*");

        // Join the EntityInfo view only when name / secondary information is used: it's a union over all
        // entity tables, so an unconditional join would slow the common case (and the count query). It's
        // keyed by entity name + id from the warning's `sourceInfo`.
        if (referencesEntityInfo(where) || referencesEntityInfo(orderBy)) {
            const entityInfoQueryBuilder = this.entityManager.createQueryBuilder(EntityInfoObject, "entityInfo");
            queryBuilder.leftJoin(entityInfoQueryBuilder, "entityInfo", {
                "entityInfo.entityName": raw(`"warning"."sourceInfo"->>'rootEntityName'`),
                "entityInfo.id": raw(`"warning"."sourceInfo"->>'targetId'`),
            });
        }

        queryBuilder.where(where).limit(limit).offset(offset);

        if (orderBy) {
            queryBuilder.orderBy(orderBy);
        }

        const [entities, totalCount] = await queryBuilder.getResultAndCount();
        return new PaginatedWarnings(entities, totalCount);
    }

    @ResolveField(() => EntityInfoObject, { nullable: true })
    async entityInfo(@Parent() warning: Warning): Promise<EntityInfoObject | undefined> {
        return this.entityInfoService.getEntityInfo(warning.sourceInfo.rootEntityName, warning.sourceInfo.targetId);
    }
}
