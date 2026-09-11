import {
    BlobStorageBackendService,
    DependenciesService,
    PageTreeNodeBaseCreateInput,
    PageTreeNodeInterface,
    PageTreeNodeVisibility,
    PageTreeService,
} from "@dextinity/cms-api";
import { CreateRequestContext, EntityManager, MikroORM } from "@mikro-orm/postgresql";
import { Inject, Logger } from "@nestjs/common";
import { Config } from "@src/config/config";
import { CONFIG } from "@src/config/config.module";
import { faker } from "@src/db/fixtures/faker";
import { generateSeoBlock } from "@src/db/fixtures/generators/blocks/seo.generator";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block";
import { StageBlock } from "@src/documents/pages/blocks/stage.block";
import { PageInput } from "@src/documents/pages/dto/page.input";
import { Page } from "@src/documents/pages/entities/page.entity";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category";
import { UserGroup } from "@src/user-groups/user-group";
import { MultiBar, Options, Presets } from "cli-progress";
import { Command, CommandRunner } from "nest-commander";
import slugify from "slugify";

import { DocumentGeneratorService } from "./generators/document-generator.service";
import { DraftJsMigrationPageFixtureService } from "./generators/draft-js-migration-page-fixture.service";
import { FileUploadsFixtureService } from "./generators/file-uploads-fixture.service";
import { ImageFixtureService } from "./generators/image-fixture.service";
import { ManyImagesTestPageFixtureService } from "./generators/many-images-test-page-fixture.service";
import { NewsFixtureService } from "./generators/news-fixture.service";
import { ProductsFixtureService } from "./generators/products-fixture.service";
import { RedirectsFixtureService } from "./generators/redirects-fixture.service";
import { VideoFixtureService } from "./generators/video-fixture.service";
import { WelcomeEmailFixtureService } from "./generators/welcome-email-fixture.service";

const getDefaultPageInput = (): PageInput => {
    const pageInput = new PageInput();
    pageInput.seo = generateSeoBlock();
    pageInput.content = PageContentBlock.blockInputFactory({ blocks: [] });
    pageInput.stage = StageBlock.blockInputFactory({ blocks: [] });
    return pageInput;
};

@Command({
    name: "fixtures",
    description: "Create fixtures with faker.js",
})
export class FixturesCommand extends CommandRunner {
    private readonly logger = new Logger(FixturesCommand.name);

    barOptions: Options = {
        format: `{bar} {percentage}% | {value}/{total} {title} | ETA: {eta_formatted} | Duration: {duration_formatted}`,
        noTTYOutput: true,
    };

    constructor(
        @Inject(CONFIG) private readonly config: Config,
        private readonly orm: MikroORM,
        private readonly entityManager: EntityManager,
        private readonly blobStorageBackendService: BlobStorageBackendService,
        private readonly documentGeneratorService: DocumentGeneratorService,
        private readonly dependenciesService: DependenciesService,
        private readonly productsFixtureService: ProductsFixtureService,
        private readonly fileUploadsFixtureService: FileUploadsFixtureService,
        private readonly imageFixtureService: ImageFixtureService,
        private readonly manyImagesTestPageFixtureService: ManyImagesTestPageFixtureService,
        private readonly pageTreeService: PageTreeService,
        private readonly redirectsFixtureService: RedirectsFixtureService,
        private readonly videoFixtureService: VideoFixtureService,
        private readonly newsFixtureService: NewsFixtureService,
        private readonly draftJsMigrationPageFixtureService: DraftJsMigrationPageFixtureService,
        private readonly welcomeEmailFixtureService: WelcomeEmailFixtureService,
    ) {
        super();
    }

    @CreateRequestContext()
    async run(): Promise<void> {
        // ensure repeatable runs
        faker.seed(123456);

        this.logger.log("Drop tables...");
        const connection = this.orm.em.getConnection();
        const tables = await connection.execute(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename;`);

        for (const table of tables) {
            await connection.execute(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
        }

        this.logger.log("Clear storage...");
        const damFilesDirectory = `${this.config.blob.storageDirectoryPrefix}-files`;
        if (await this.blobStorageBackendService.folderExists(damFilesDirectory)) {
            await this.blobStorageBackendService.removeFolder(damFilesDirectory);
        }
        await this.blobStorageBackendService.createFolder(damFilesDirectory);

        this.logger.log("Run migrations...");
        const migrator = this.orm.getMigrator();
        await migrator.up();

        const scope = { domain: "main", language: "en" };

        const multiBar = new MultiBar(this.barOptions, Presets.shades_classic);

        this.logger.log("Generate Images...");
        await this.imageFixtureService.generateImages(5, { domain: "main" });

        this.logger.log("Generate Videos...");
        await this.videoFixtureService.generateVideos({ domain: "main" });

        this.logger.log("Generate Welcome Email...");
        await this.welcomeEmailFixtureService.generate(scope);

        this.logger.log("Generate Pages...");
        await this.documentGeneratorService.generatePage({ name: "Home", scope });
        const blockCategoriesPage = await this.documentGeneratorService.generatePage({ name: "Fixtures: Blocks", scope });

        await this.documentGeneratorService.generatePage({ name: "Layout", scope, blockCategory: "layout", parentId: blockCategoriesPage.id });
        await this.documentGeneratorService.generatePage({ name: "Media", scope, blockCategory: "media", parentId: blockCategoriesPage.id });
        await this.documentGeneratorService.generatePage({
            name: "Navigation",
            scope,
            blockCategory: "navigation",
            parentId: blockCategoriesPage.id,
        });
        await this.documentGeneratorService.generatePage({ name: "Teaser", scope, blockCategory: "teaser", parentId: blockCategoriesPage.id });
        await this.documentGeneratorService.generatePage({
            name: "Text and Content",
            scope,
            blockCategory: "textAndContent",
            parentId: blockCategoriesPage.id,
        });

        await this.documentGeneratorService.generatePage({
            name: "Form",
            scope,
            blockCategory: "form",
            parentId: blockCategoriesPage.id,
        });

        this.logger.log("Generate Many Images Test Page...");
        await this.manyImagesTestPageFixtureService.execute();
        this.logger.log("Many Images Test Page created");

        this.logger.log("Generate DraftJS Migration Demo Page...");
        await this.draftJsMigrationPageFixtureService.execute();
        this.logger.log("DraftJS Migration Demo Page created");

        this.logger.log("Generate Lorem Ispum Fixtures...");
        const NUMBER_OF_DOMAINS_WITH_LORUM_IPSUM_CONTENT = 0; // Increase number to generate lorum ipsum fixtures
        for (let domainNum = 0; domainNum < NUMBER_OF_DOMAINS_WITH_LORUM_IPSUM_CONTENT; domainNum++) {
            const domain = domainNum === 0 ? "secondary" : `${faker.lorem.word().toLowerCase()}.com`;
            let pagesCount = 0;
            const pages = [];
            for (let level = 0; level < 10; level++) {
                const pagesForLevel: PageTreeNodeInterface[] = [];

                for (let i = 0; i < faker.number.int({ min: 100, max: 200 }); i++) {
                    const name = faker.lorem.sentence();
                    const pageId = faker.string.uuid();

                    const page = await this.pageTreeService.createNode(
                        {
                            name: name,
                            slug: slugify(name),
                            parentId: level > 0 ? faker.helpers.arrayElement(pages[level - 1]).id : undefined,
                            attachedDocument: { id: pageId, type: "Page" },
                            userGroup: UserGroup.all,
                        } as PageTreeNodeBaseCreateInput, // Typing of PageTreeService is wrong https://github.com/vivid-planet/dextinity/pull/1515#issue-2042001589
                        PageTreeNodeCategory.mainNavigation,
                        {
                            domain,
                            language: "en",
                        },
                    );
                    pagesForLevel.push(page);
                    pagesCount++;

                    const pageInput = getDefaultPageInput();

                    await this.entityManager.persistAndFlush(
                        this.entityManager.create(Page, {
                            id: pageId,
                            content: pageInput.content.transformToBlockData(),
                            seo: pageInput.seo.transformToBlockData(),
                            stage: pageInput.stage.transformToBlockData(),
                        }),
                    );

                    await this.pageTreeService.updateNodeVisibility(
                        page.id,
                        faker.helpers.arrayElement([
                            PageTreeNodeVisibility.Published,
                            PageTreeNodeVisibility.Unpublished,
                            PageTreeNodeVisibility.Archived,
                        ]),
                    );
                }

                pages.push(pagesForLevel);
            }
            this.logger.log(`Generated ${pagesCount} lorem ipsum pages for ${domain}`);
            this.entityManager.clear();
        }

        this.logger.log("Generate File Uploads...");
        await this.fileUploadsFixtureService.generateFileUploads();

        this.logger.log("Generate Redirects...");
        await this.redirectsFixtureService.generateRedirects();

        await this.productsFixtureService.generate();

        await this.newsFixtureService.generate();

        multiBar.stop();

        await this.dependenciesService.createViews();

        await this.orm.em.flush();
    }
}
