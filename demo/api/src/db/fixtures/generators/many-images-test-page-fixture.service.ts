import { PageTreeNodeBaseCreateInput, PageTreeNodeVisibility, PageTreeService } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { DamScope } from "@src/dam/dto/dam-scope";
import { faker } from "@src/db/fixtures/faker";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block";
import { StageBlock } from "@src/documents/pages/blocks/stage.block";
import { PageInput } from "@src/documents/pages/dto/page.input";
import { Page } from "@src/documents/pages/entities/page.entity";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category";
import { UserGroup } from "@src/user-groups/user-group";

import { generateImageBlock } from "./blocks/image.generator";
import { generateSeoBlock } from "./blocks/seo.generator";
import { ImageFileFixtureService } from "./image-file-fixture.service";
import { SvgImageFileFixtureService } from "./svg-image-file-fixture.service";

@Injectable()
export class ManyImagesTestPageFixtureService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
        private readonly imageFileFixtureService: ImageFileFixtureService,
        private readonly svgImageFileFixtureService: SvgImageFileFixtureService,
    ) {}

    async execute(): Promise<void> {
        const uuidDocument = "c66ebddd-ecd1-430c-9ea2-8a482c62ad70";

        const scope: PageTreeNodeScope = {
            domain: "main",
            language: "en",
        };

        const damScope: DamScope = {
            domain: "main",
        };

        const manyImagesTestPageTreeNode = await this.pageTreeService.createNode(
            {
                name: "Test many images",
                slug: "test-many-images",
                attachedDocument: {
                    id: uuidDocument,
                    type: "Page",
                },
                userGroup: UserGroup.all,
            } as PageTreeNodeBaseCreateInput, // Typing of PageTreeService is wrong https://github.com/vivid-planet/dextinity/pull/1515#issue-2042001589
            PageTreeNodeCategory.mainNavigation,
            scope,
        );

        await this.pageTreeService.updateNodeVisibility(manyImagesTestPageTreeNode.id, PageTreeNodeVisibility.Published);

        const imageBlocks: ReturnType<typeof generateImageBlock>[] = [];
        const imageFiles = await this.imageFileFixtureService.uploadImagesFromSrc(damScope);
        for (const image of imageFiles) {
            imageBlocks.push(generateImageBlock(image));
        }
        const svgFile = await this.svgImageFileFixtureService.generateImage(damScope);
        imageBlocks.push(generateImageBlock(svgFile));

        const pageInput = new PageInput();
        pageInput.seo = generateSeoBlock();
        pageInput.content = PageContentBlock.blockInputFactory({
            blocks: imageBlocks.map((c) => ({
                key: faker.string.uuid(),
                visible: true,
                type: "image",
                props: c,
                userGroup: UserGroup.all,
            })),
        });
        pageInput.stage = StageBlock.blockInputFactory({ blocks: [] });

        await this.entityManager.persistAndFlush(
            this.entityManager.create(Page, {
                id: uuidDocument,
                content: pageInput.content.transformToBlockData(),
                seo: pageInput.seo.transformToBlockData(),
                createdAt: new Date(),
                updatedAt: new Date(),
                stage: pageInput.stage.transformToBlockData(),
            }),
        );
    }
}
