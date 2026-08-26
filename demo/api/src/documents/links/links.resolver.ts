import {
    AffectedEntity,
    PageTreeNodeInterface,
    PageTreeNodeVisibility,
    PageTreeService,
    RequiredPermission,
    validateNotModified,
} from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { UnauthorizedException } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity";

import { LinkInput } from "./dto/link.input";
import { Link } from "./entities/link.entity";

@Resolver(() => Link)
@RequiredPermission(["pageTree"])
export class LinksResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
    ) {}

    @Query(() => Link, { nullable: true })
    @AffectedEntity(Link)
    async link(@Args("id", { type: () => ID }) id: string): Promise<Link | null> {
        return this.entityManager.findOne(Link, id);
    }

    @ResolveField(() => PageTreeNode, { nullable: true })
    async pageTreeNode(@Parent() link: Link): Promise<PageTreeNodeInterface | null> {
        return this.pageTreeService.createReadApi({ visibility: "all" }).getFirstNodeByAttachedPageId(link.id);
    }

    @Mutation(() => Link)
    @AffectedEntity(Link, { pageTreeNodeIdArg: "attachedPageTreeNodeId" })
    async saveLink(
        @Args("id", { type: () => ID }) id: string,
        @Args("input", { type: () => LinkInput }) input: LinkInput,
        @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        @Args("attachedPageTreeNodeId", { nullable: true, type: () => ID }) attachedPageTreeNodeId?: string,
    ): Promise<Link | null> {
        // all pageTypes need this is-archived-page-check
        if (attachedPageTreeNodeId) {
            const pageTreeNode = await this.pageTreeService.createReadApi({ visibility: "all" }).getNodeOrFail(attachedPageTreeNodeId);
            if (pageTreeNode.visibility === PageTreeNodeVisibility.Archived) {
                throw new UnauthorizedException("Archived Links cannot be updated");
            }
        }

        let link = await this.entityManager.findOne(Link, id);

        if (link) {
            if (lastUpdatedAt) {
                validateNotModified(link, lastUpdatedAt);
            }

            link.assign({ content: input.content.transformToBlockData() });
        } else {
            link = this.entityManager.create(Link, {
                id,
                content: input.content.transformToBlockData(),
            });

            this.entityManager.persist(link);
        }

        if (attachedPageTreeNodeId) {
            await this.pageTreeService.attachDocument({ id, type: "Link" }, attachedPageTreeNodeId);
        }

        await this.entityManager.flush();

        return link;
    }
}
