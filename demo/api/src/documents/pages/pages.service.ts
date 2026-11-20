import { type BlockInputInterface, PageTreeNodeVisibility, PageTreeService, validateNotModified } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { Page } from "./entities/page.entity.js";

@Injectable()
export class PagesService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
    ) {}

    async savePage({
        pageId,
        input,
        lastUpdatedAt,
        attachedPageTreeNodeId,
    }: {
        pageId: string;
        input: { content: BlockInputInterface; seo: BlockInputInterface; stage: BlockInputInterface };
        lastUpdatedAt?: Date;
        attachedPageTreeNodeId?: string;
    }): Promise<Page> {
        // all pageTypes need this is-archived-page-check
        if (attachedPageTreeNodeId) {
            const pageTreeNode = await this.pageTreeService.createReadApi({ visibility: "all" }).getNodeOrFail(attachedPageTreeNodeId);
            if (pageTreeNode.visibility === PageTreeNodeVisibility.Archived) {
                throw new UnauthorizedException("Archived pages cannot be updated");
            }
        }

        let page = await this.entityManager.findOne(Page, pageId);

        if (page) {
            if (lastUpdatedAt) {
                validateNotModified(page, lastUpdatedAt);
            }

            page.assign({
                content: input.content.transformToBlockData(),
                seo: input.seo.transformToBlockData(),
                stage: input.stage.transformToBlockData(),
            });
        } else {
            page = this.entityManager.create(Page, {
                id: pageId,
                content: input.content.transformToBlockData(),
                seo: input.seo.transformToBlockData(),
                stage: input.stage.transformToBlockData(),
            });

            this.entityManager.persist(page);
        }

        if (attachedPageTreeNodeId) {
            await this.pageTreeService.attachDocument({ id: pageId, type: "Page" }, attachedPageTreeNodeId);
        }

        await this.entityManager.flush();

        return page;
    }
}
