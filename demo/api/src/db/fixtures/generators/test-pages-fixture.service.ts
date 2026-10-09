import { PageTreeNodeBaseCreateInput, PageTreeNodeInterface, PageTreeNodeVisibility, PageTreeService } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { Spacing } from "@src/common/blocks/space.block";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block";
import { StageBlock } from "@src/documents/pages/blocks/stage.block";
import { Page } from "@src/documents/pages/entities/page.entity";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category";
import { UserGroup } from "@src/user-groups/user-group";

import { generateContentBlock, generateHeadingBlock, generateSpaceBlock } from "./blocks/page-content-block.generator";
import { generateSeoBlock } from "./blocks/seo.generator";

/**
 * Parent page of the hand-written pages that test or debug a single feature. Its page-tree index
 * lists them, so a new test page needs no change here.
 */
@Injectable()
export class TestPagesFixtureService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
    ) {}

    async execute(): Promise<PageTreeNodeInterface> {
        const documentId = "deadbeef-0000-4000-8000-000000000010";
        const scope: PageTreeNodeScope = { domain: "main", language: "en" };

        const node = await this.pageTreeService.createNode(
            {
                name: "Test Pages",
                slug: "test-pages",
                attachedDocument: { id: documentId, type: "Page" },
                userGroup: UserGroup.all,
            } as PageTreeNodeBaseCreateInput, // Typing of PageTreeService is wrong https://github.com/vivid-planet/dextinity/pull/1515#issue-2042001589
            PageTreeNodeCategory.mainNavigation,
            scope,
        );
        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        const blocks = [
            generateSpaceBlock(Spacing.d200),
            generateHeadingBlock({ text: "Test Pages", level: 1 }),
            generateSpaceBlock(Spacing.d200),
            generateContentBlock({ type: "pageTreeIndex", props: {} }),
        ];

        await this.entityManager.persistAndFlush(
            this.entityManager.create(Page, {
                id: documentId,
                content: PageContentBlock.blockInputFactory({ blocks }).transformToBlockData(),
                seo: generateSeoBlock().transformToBlockData(),
                stage: StageBlock.blockInputFactory({ blocks: [] }).transformToBlockData(),
            }),
        );

        return node;
    }
}
