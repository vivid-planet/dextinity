import { EntityManager, type QBFilterQuery, QueryOrder, type QueryOrderMap, raw } from "@mikro-orm/postgresql";
import { Inject } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { GetCurrentUser } from "../auth/decorators/get-current-user.decorator.js";
import { RequestContext, type RequestContextInterface } from "../common/decorators/request-context.decorator.js";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator.js";
import { CurrentUser } from "../user-permissions/dto/current-user.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants.js";
import type { AccessControlServiceInterface } from "../user-permissions/user-permissions.types.js";
import { FullTextSearchArgs } from "./dto/full-text-search.args.js";
import { FullTextSearchResults, FullTextSearchTypeCount } from "./dto/full-text-search-results.object.js";
import { EntityInfoFullTextObject } from "./entities/entity-info-full-text.object.js";
import { type FullTextSearchRow, FullTextSnippetService } from "./full-text-snippet.service.js";
import { ANY_TERM_TSQUERY_SQL, PREFIX_TSQUERY_SQL, prefixFullTextCondition } from "./prefix-full-text-query.js";

@Resolver()
@RequiredPermission("fullTextSearch", { skipScopeCheck: true })
export class FullTextSearchResolver {
    constructor(
        private readonly entityManager: EntityManager,
        @Inject(ACCESS_CONTROL_SERVICE) private readonly accessControlService: AccessControlServiceInterface,
        private readonly fullTextSnippetService: FullTextSnippetService,
    ) {}

    @Query(() => FullTextSearchResults)
    async myFullTextSearch(
        @Args() { search, scope, types, offset, limit }: FullTextSearchArgs,
        @GetCurrentUser() user: CurrentUser,
        @RequestContext() { includeInvisiblePages }: RequestContextInterface,
    ): Promise<FullTextSearchResults> {
        const allowedPermissions = [...new Set(user.permissions.map(({ permission }) => permission))].filter(
            (permission) => !scope || this.accessControlService.isAllowed(user, permission, scope),
        );

        if (allowedPermissions.length === 0) {
            return { nodes: [], totalCount: 0, types: [] };
        }

        // A raw() fragment can only be used in one query, so each query gets its own condition
        const createWhere = () => buildWhere({ search, scope, allowedPermissions, includeInvisible: !!includeInvisiblePages?.length });

        const [rows, typeCounts] = await Promise.all([
            this.entityManager
                .createQueryBuilder(EntityInfoFullTextObject, "f")
                .join("f.entityInfo", "e")
                .select(["id", "entityName", "type", "e.name", "e.secondaryInformation", "e.visible"])
                .where({ ...createWhere(), ...(types ? { type: { $in: types } } : {}) })
                .orderBy([...orderByNameMatchAndRank(search), { entityName: QueryOrder.ASC }, { id: QueryOrder.ASC }])
                .offset(offset)
                .limit(limit)
                .execute<FullTextSearchRow[]>("all"),
            this.entityManager
                .createQueryBuilder(EntityInfoFullTextObject, "f")
                .join("f.entityInfo", "e")
                .select(["type", raw(`count(*)::int AS "count"`)])
                .where(createWhere())
                .groupBy("type")
                .orderBy([{ [raw("count(*)")]: QueryOrder.DESC }, { type: QueryOrder.ASC }])
                .execute<FullTextSearchTypeCount[]>("all"),
        ]);

        return {
            nodes: await this.fullTextSnippetService.addHighlights(rows, search),
            totalCount: typeCounts.filter(({ type }) => !types || types.includes(type)).reduce((sum, { count }) => sum + count, 0),
            types: typeCounts,
        };
    }
}

function buildWhere({
    search,
    scope,
    allowedPermissions,
    includeInvisible,
}: {
    search: string;
    scope?: ContentScope;
    allowedPermissions: string[];
    includeInvisible: boolean;
}): QBFilterQuery<EntityInfoFullTextObject> {
    const where: QBFilterQuery<EntityInfoFullTextObject> = {
        ...prefixFullTextCondition(search),
        requiredPermission: { $overlap: allowedPermissions },
        ...(includeInvisible ? {} : { entityInfo: { visible: true } }),
    };

    if (scope) {
        // The view exposes a `scopes` array, so match rows whose scopes contain the requested scope. Unscoped entities are part of every scope.
        // GraphQL sends the scope object with a null prototype, which breaks MikroORM's internal hasOwnProperty calls.
        // Spreading into a plain object fixes this. See https://github.com/mikro-orm/mikro-orm/issues/2846.
        where.$or = [{ scopes: null }, { scopes: { $contains: [{ ...scope }] } }];
    }

    return where;
}

// Orders by how well the name matches (exact name, all terms, some terms), then by rank and by the length of the name.
// Weights are D, C, B, A. Normalization 1 divides the rank by 1 + log(document length), so long texts don't win by repetition.
function orderByNameMatchAndRank(search: string): QueryOrderMap<EntityInfoFullTextObject>[] {
    const nameVector = `to_tsvector('simple', e."name")`;

    return [
        { [raw(`lower(e."name") = lower(btrim(?))`, [search])]: QueryOrder.DESC },
        { [raw(`${nameVector} @@ ${PREFIX_TSQUERY_SQL}`, [search])]: QueryOrder.DESC },
        { [raw(`${nameVector} @@ ${ANY_TERM_TSQUERY_SQL}`, [search])]: QueryOrder.DESC },
        { [raw(`ts_rank('{0.1,0.2,0.4,1.0}', f."fullText", ${PREFIX_TSQUERY_SQL}, 1)`, [search])]: QueryOrder.DESC },
        { [raw(`length(e."name")`)]: QueryOrder.ASC },
    ];
}
