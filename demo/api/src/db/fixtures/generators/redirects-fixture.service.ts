import {
    AttachedDocument,
    PageTreeNodeVisibility,
    RedirectGenerationType,
    REDIRECTS_LINK_BLOCK,
    type RedirectsLinkBlock,
    RedirectSourceType,
    resolveEntityClass,
} from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker.js";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block.js";
import { SeoBlock } from "@src/documents/pages/blocks/seo.block.js";
import { StageBlock } from "@src/documents/pages/blocks/stage.block.js";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category.js";
import { UserGroup } from "@src/user-groups/user-group.js";

import { SeoBlockFixtureService } from "./seo-block-fixture.service.js";

@Injectable()
export class RedirectsFixtureService {
    constructor(
        @Inject(REDIRECTS_LINK_BLOCK) private readonly redirectsLinkBlock: RedirectsLinkBlock,
        private readonly seoBlockFixtureService: SeoBlockFixtureService,
        private readonly entityManager: EntityManager,
    ) {}

    async generateRedirects(): Promise<void> {
        const pages = [];
        const pageTreeNodeIds = [];

        for (let level = 0; level < 10; level++) {
            const pagesForLevel = [];

            for (let i = 0; i < 100; i++) {
                const pageTreeNodeId = faker.string.uuid();
                const pageId = faker.string.uuid();

                this.entityManager.persist(
                    this.entityManager.create(Page, {
                        id: pageId,
                        content: PageContentBlock.blockInputFactory({ blocks: [] }).transformToBlockData(),
                        stage: StageBlock.blockInputFactory({ blocks: [] }).transformToBlockData(),
                        seo: SeoBlock.blockDataFactory(await this.seoBlockFixtureService.generateBlockInput()),
                    }),
                );
                this.entityManager.persist(
                    this.entityManager.create(PageTreeNode, {
                        id: pageTreeNodeId,
                        parentId: level > 0 ? faker.helpers.arrayElement(pages[level - 1]) : null,
                        name: `Page ${i}`,
                        slug: `page-${i}`,
                        documentType: "Page",
                        visibility: PageTreeNodeVisibility.Published,
                        scope: { domain: "secondary", language: "en" },
                        userGroup: UserGroup.all,
                        pos: i,
                        category: PageTreeNodeCategory.mainNavigation,
                    }),
                );
                this.entityManager.persist(this.entityManager.create(AttachedDocument, { pageTreeNodeId, documentId: pageId, type: "Page" }));

                pagesForLevel.push(pageTreeNodeId);
            }

            pages.push(pagesForLevel);
            pageTreeNodeIds.push(...pagesForLevel);
        }

        for (let i = 0; i < 7000; i++) {
            this.entityManager.create(resolveEntityClass("Redirect"), {
                generationType: RedirectGenerationType.manual,
                source: `/redirect-${i}`,
                target: this.redirectsLinkBlock
                    .blockInputFactory({
                        attachedBlocks: [
                            {
                                type: "internal",
                                props: {
                                    targetPageId: faker.helpers.arrayElement(pageTreeNodeIds),
                                },
                            },
                        ],
                        activeType: "internal",
                    })
                    .transformToBlockData(),
                active: true,
                scope: {
                    domain: "secondary",
                },
                sourceType: RedirectSourceType.path,
            });
        }

        await this.entityManager.flush();
    }
}
