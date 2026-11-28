import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import { GetCurrentUser } from "../auth/decorators/get-current-user.decorator";
import { RequestContext, type RequestContextInterface } from "../common/decorators/request-context.decorator";
import { EntityInfoObject } from "../entity-info/entity-info.object";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../user-permissions/dto/current-user";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { FullTextSearchArgs } from "./dto/full-text-search.args";
import { FullTextSearchResults } from "./dto/full-text-search-results.object";
import { FullTextSearchType } from "./dto/full-text-search-type.object";
import { PaginatedEntityInfo } from "./dto/paginated-entity-info";
import { filterAllowedFullTextSearchTypes } from "./filter-allowed-full-text-search-types";
import { FullTextSearchService } from "./full-text-search.service";
import { FullTextSearchQueryService } from "./full-text-search-query.service";
import { FullTextSnippetService } from "./full-text-snippet.service";

@Resolver(() => EntityInfoObject)
@RequiredPermission("fullTextSearch", { skipScopeCheck: true })
export class FullTextSearchResolver {
    constructor(
        private readonly fullTextSearchQueryService: FullTextSearchQueryService,
        private readonly fullTextSnippetService: FullTextSnippetService,
        private readonly fullTextSearchService: FullTextSearchService,
    ) {}

    @Query(() => [FullTextSearchType], { description: "All types the current user may search, whether they have results or not" })
    fullTextSearchTypes(@GetCurrentUser() user: CurrentUser): FullTextSearchType[] {
        return filterAllowedFullTextSearchTypes(this.fullTextSearchService.getFullTextSearchTypes(), user.permissions).map(
            ({ type, entityName }) => ({ type, entityName }),
        );
    }

    @Query(() => FullTextSearchResults)
    async fullTextSearch(
        @Args() { search, scope, types, offset, limit }: FullTextSearchArgs,
        @GetCurrentUser() user: CurrentUser,
        @RequestContext() { includeInvisiblePages }: RequestContextInterface,
    ): Promise<FullTextSearchResults> {
        const result = await this.fullTextSearchQueryService.search({
            search,
            scope,
            types,
            offset,
            limit,
            permissions: user.permissions,
            includeInvisible: !!includeInvisiblePages?.length,
        });
        const nodes = await this.fullTextSnippetService.buildResults(result.rows, search);

        return new FullTextSearchResults({ nodes, totalCount: result.totalCount, types: result.types });
    }

    @Query(() => PaginatedEntityInfo, { deprecationReason: "Use fullTextSearch instead. Will be removed in version 11." })
    async myFullTextSearch(
        @Args("search") search: string,
        @Args("offset", { type: () => Int, defaultValue: 0 }) offset: number,
        @Args("limit", { type: () => Int, defaultValue: 25 }) limit: number,
        @GetCurrentUser() user: CurrentUser,
        @RequestContext() { includeInvisiblePages }: RequestContextInterface,
        @Args("scope", { type: () => GraphQLJSONObject, nullable: true }) scope?: ContentScope,
    ): Promise<PaginatedEntityInfo> {
        const { rows, totalCount } = await this.fullTextSearchQueryService.search({
            search,
            scope,
            offset,
            limit,
            permissions: user.permissions,
            includeInvisible: !!includeInvisiblePages?.length,
        });

        return new PaginatedEntityInfo(
            rows.map(({ id, entityName, name, secondaryInformation, visible }) =>
                Object.assign(new EntityInfoObject(), { id, entityName, name, secondaryInformation, visible }),
            ),
            totalCount,
        );
    }
}
