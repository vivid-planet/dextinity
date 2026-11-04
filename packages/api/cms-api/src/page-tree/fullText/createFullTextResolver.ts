import { EntityManager, FilterQuery } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";

import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { EmptyPageTreeNodeScope } from "../dto/empty-page-tree-node-scope";
import { PageTreeService } from "../page-tree.service";
import { PageTreeReadApiService } from "../page-tree-read-api.service";
import { PageTreeNodeInterface, ScopeInterface } from "../types";
import { PageTreeNodeFullText } from "./entities/page-tree-node-full-text.object";

export function createFullTextResolver({
    PageTreeNode,
    Scope: PassedScope,
    PaginatedPageTreeNodes,
}: {
    PageTreeNode: Type<PageTreeNodeInterface>;
    Scope?: Type<ScopeInterface>;
    PaginatedPageTreeNodes: Type;
}): Type {
    const Scope = PassedScope || EmptyPageTreeNodeScope;

    const hasNonEmptyScope = !!PassedScope;

    function nonEmptyScopeOrNothing(scope: ScopeInterface): ScopeInterface | undefined {
        // GraphQL sends the scope object with a null prototype ([Object: null prototype] { <key>: <value> }), but MikroORM uses the
        // object's hasOwnProperty method internally, resulting in a "object.hasOwnProperty is not a function" error. To fix this, we
        // create a "real" JavaScript object by using the spread operator.
        // See https://github.com/mikro-orm/mikro-orm/issues/2846 for more information.
        return hasNonEmptyScope ? { ...scope } : undefined;
    }

    @Resolver(() => PageTreeNode)
    @RequiredPermission(["pageTree"], { skipScopeCheck: !hasNonEmptyScope })
    class PageTreeFullTextResolver {
        constructor(
            protected readonly pageTreeService: PageTreeService,
            protected readonly pageTreeReadApi: PageTreeReadApiService,
            private readonly entityManager: EntityManager,
        ) {}

        @Query(() => PaginatedPageTreeNodes)
        async pageTreeFullTextSearch(
            @Args("search") search: string,
            @Args("scope", { type: () => Scope }) scope: ScopeInterface,
            @Args("offset", { type: () => Int, defaultValue: 0 }) offset: number,
            @Args("limit", { type: () => Int, defaultValue: 25 }) limit: number,
        ): Promise<typeof PaginatedPageTreeNodes> {
            const where: FilterQuery<PageTreeNodeFullText> = {
                fullText: { $fulltext: search },
            };

            const scopeValue = nonEmptyScopeOrNothing(scope);
            if (scopeValue) {
                where.pageTreeNode = { scope: scopeValue };
            }

            const [results, totalCount] = await this.entityManager.findAndCount(PageTreeNodeFullText, where, {
                offset,
                limit,
            });

            const nodes = await this.pageTreeReadApi.getNodesByIds(results.map((r) => r.pageTreeNodeId));

            return new PaginatedPageTreeNodes(nodes, totalCount);
        }
    }

    return PageTreeFullTextResolver;
}
