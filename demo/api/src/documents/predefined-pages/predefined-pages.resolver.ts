import { AffectedEntity, PageTreeNodeVisibility, PageTreeService, RequiredPermission, validateNotModified } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { UnauthorizedException } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { PredefinedPageInput } from "./dto/predefined-page.input";
import { PredefinedPage } from "./entities/predefined-page.entity";

@Resolver(() => PredefinedPage)
@RequiredPermission("pageTree")
export class PredefinedPagesResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
    ) {}

    @Query(() => PredefinedPage)
    @AffectedEntity(PredefinedPage)
    async predefinedPage(@Args("id", { type: () => ID }) id: string): Promise<PredefinedPage> {
        const predefinedPage = await this.entityManager.findOneOrFail(PredefinedPage, id);
        return predefinedPage;
    }

    @Mutation(() => PredefinedPage)
    @AffectedEntity(PredefinedPage, { pageTreeNodeIdArg: "attachedPageTreeNodeId" })
    async savePredefinedPage(
        @Args("id", { type: () => ID }) id: string,
        @Args("input", { type: () => PredefinedPageInput }) input: PredefinedPageInput,
        @Args("attachedPageTreeNodeId", { type: () => ID }) attachedPageTreeNodeId: string,
        @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
    ): Promise<PredefinedPage> {
        // all pageTypes need this is-archived-page-check
        // TODO: maybe implemented in a base-(document|page)-service which lives in @dextinity/cms-api
        const pageTreeNode = await this.pageTreeService.createReadApi({ visibility: "all" }).getNodeOrFail(attachedPageTreeNodeId);
        if (pageTreeNode.visibility === PageTreeNodeVisibility.Archived) {
            throw new UnauthorizedException("Archived Structured Content cannot be updated");
        }

        let predefinedPage = await this.entityManager.findOne(PredefinedPage, id);

        if (predefinedPage) {
            if (lastUpdatedAt) {
                validateNotModified(predefinedPage, lastUpdatedAt);
            }

            predefinedPage.assign({
                type: input.type,
            });
        } else {
            predefinedPage = this.entityManager.create(PredefinedPage, {
                id,
                type: input.type,
            });
        }

        await this.pageTreeService.attachDocument({ id, type: "PredefinedPage" }, attachedPageTreeNodeId);

        await this.entityManager.flush();

        return predefinedPage;
    }
}
