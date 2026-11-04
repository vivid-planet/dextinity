import { EntityManager, FilterQuery } from "@mikro-orm/postgresql";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import { GetCurrentUser } from "../auth/decorators/get-current-user.decorator";
import { RequestContext, type RequestContextInterface } from "../common/decorators/request-context.decorator";
import { EntityInfoObject } from "../entity-info/entity-info.object";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { PaginatedEntityInfo } from "./dto/paginated-entity-info";
import { EntityInfoFullTextObject } from "./entities/entity-info-full-text.object";

@Resolver(() => EntityInfoObject)
@RequiredPermission("fullTextSearch", { skipScopeCheck: true })
export class FullTextSearchResolver {
    constructor(private readonly entityManager: EntityManager) {}

    @Query(() => PaginatedEntityInfo)
    async myFullTextSearch(
        @Args("search") search: string,
        @Args("offset", { type: () => Int, defaultValue: 0 }) offset: number,
        @Args("limit", { type: () => Int, defaultValue: 25 }) limit: number,
        @GetCurrentUser() user: CurrentUser,
        @RequestContext() { includeInvisiblePages }: RequestContextInterface,
        @Args("scope", { type: () => GraphQLJSONObject, nullable: true }) scope?: ContentScope,
    ): Promise<PaginatedEntityInfo> {
        const allowedPermissions = user.permissions.map((p) => p.permission);

        if (allowedPermissions.length === 0) {
            return new PaginatedEntityInfo([], 0);
        }

        const where: FilterQuery<EntityInfoFullTextObject> = {
            fullText: { $fulltext: search },
            requiredPermission: { $overlap: allowedPermissions },
            ...(includeInvisiblePages?.length ? {} : { entityInfo: { visible: true } }),
        };

        if (scope) {
            // The view exposes a `scopes` array, so match rows whose scopes contain the requested scope.
            // GraphQL sends the scope object with a null prototype, which breaks MikroORM's internal hasOwnProperty calls.
            // Spreading into a plain object fixes this. See https://github.com/mikro-orm/mikro-orm/issues/2846.
            where.scopes = { $contains: [{ ...scope }] };
        }

        const [matches, totalCount] = await this.entityManager.findAndCount(EntityInfoFullTextObject, where, {
            offset,
            limit,
            populate: ["entityInfo"],
        });

        return new PaginatedEntityInfo(
            matches.map((match) => match.entityInfo),
            totalCount,
        );
    }
}
