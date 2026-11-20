import { AffectedEntity, type PageTreeNodeInterface, PageTreeService, RequiredPermission } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";

import { PageInput } from "./dto/page.input.js";
import { Page } from "./entities/page.entity.js";
import { PagesService } from "./pages.service.js";

@Resolver(() => Page)
@RequiredPermission(["pageTree"])
export class PagesResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
        private readonly pagesService: PagesService,
    ) {}

    @Query(() => Page)
    @AffectedEntity(Page)
    async page(@Args("id", { type: () => ID }) id: string): Promise<Page> {
        return this.entityManager.findOneOrFail(Page, { id });
    }

    @ResolveField(() => PageTreeNode, { nullable: true })
    async pageTreeNode(@Parent() page: Page): Promise<PageTreeNodeInterface | null> {
        return this.pageTreeService.createReadApi({ visibility: "all" }).getFirstNodeByAttachedPageId(page.id);
    }

    @Mutation(() => Page)
    @AffectedEntity(Page, { pageTreeNodeIdArg: "attachedPageTreeNodeId" })
    async savePage(
        @Args("pageId", { type: () => ID }) pageId: string,
        @Args("input", { type: () => PageInput }) input: PageInput,
        @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        @Args("attachedPageTreeNodeId", { nullable: true, type: () => ID }) attachedPageTreeNodeId?: string,
    ): Promise<Page | null> {
        return this.pagesService.savePage({ pageId, input, lastUpdatedAt, attachedPageTreeNodeId });
    }
}
