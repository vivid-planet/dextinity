import { NestFactory } from "@nestjs/core";
import { Field, GraphQLSchemaBuilderModule, GraphQLSchemaFactory, ObjectType, Query, registerEnumType, Resolver } from "@nestjs/graphql";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";

import {
    BuildsResolver,
    type CorePermission,
    createAuthResolver,
    createOneOfBlock,
    createPageTreeResolver,
    createRedirectsResolver,
    DependenciesResolverFactory,
    DependentsResolverFactory,
    DocumentInterface,
    ExternalLinkBlock,
    FileImagesResolver,
    FileUpload,
    InternalLinkBlock,
    PageTreeNodeBase,
    type PageTreeNodeCategory,
    PaginatedPageTreeNodesFactory,
} from "./lib/index.js";
import { BuildTemplatesResolver } from "./lib/builds/build-templates.resolver.js";
import { GenerateAltTextResolver } from "./lib/content-generation/generate-alt-text.resolver.js";
import { GenerateImageTitleResolver } from "./lib/content-generation/generate-image-title.resolver.js";
import { GenerateSeoTagsResolver } from "./lib/content-generation/generate-seo-tags.resolver.js";
import { CronJobsResolver } from "./lib/cron-jobs/cron-jobs.resolver.js";
import { JobsResolver } from "./lib/cron-jobs/jobs.resolver.js";
import { createDamItemsResolver } from "./lib/dam/files/dam-items.resolver.js";
import { createDamMediaAlternativeResolver } from "./lib/dam/files/dam-media-alternatives/dam-media-alternative.resolver.js";
import { createFileEntity } from "./lib/dam/files/entities/file.entity.js";
import { createFolderEntity } from "./lib/dam/files/entities/folder.entity.js";
import { FileLicensesResolver } from "./lib/dam/files/file-licenses.resolver.js";
import { createFilesResolver } from "./lib/dam/files/files.resolver.js";
import { createFoldersResolver } from "./lib/dam/files/folders.resolver.js";
import { FileUploadsResolver } from "./lib/file-uploads/file-uploads.resolver.js";
import { FullTextSearchResolver } from "./lib/full-text-search/full-text-search.resolver.js";
import { SitePreviewResolver } from "./lib/page-tree/site-preview.resolver.js";
import { RedirectInputFactory } from "./lib/redirects/dto/redirect-input.factory.js";
import { RedirectEntityFactory } from "./lib/redirects/entities/redirect-entity.factory.js";
import { AzureAiTranslatorResolver } from "./lib/translation/azure-ai-translator.resolver.js";
import { UserResolver } from "./lib/user-permissions/user.resolver.js";
import { UserContentScopesResolver } from "./lib/user-permissions/user-content-scopes.resolver.js";
import { UserPermissionResolver } from "./lib/user-permissions/user-permission.resolver.js";
import { WarningResolver } from "./lib/warnings/warning.resolver.js";
import { CombinedPermission } from "./lib/user-permissions/user-permissions.types.js";

@ObjectType()
class PageTreeNode extends PageTreeNodeBase {
    @Field(() => String)
    category: PageTreeNodeCategory;
}

@ObjectType({
    implements: () => [DocumentInterface],
})
class Page implements DocumentInterface {
    id: string;
    updatedAt: Date;
}

async function generateSchema(): Promise<void> {
    console.info("Generating schema.gql...");

    const app = await NestFactory.create(GraphQLSchemaBuilderModule);
    await app.init();

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory);

    const linkBlock = createOneOfBlock(
        { supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock }, allowEmpty: false },
        "RedirectsLink",
    );
    const RedirectEntity = RedirectEntityFactory.create({ linkBlock });
    const RedirectInput = RedirectInputFactory.create({ linkBlock });

    const redirectsResolver = createRedirectsResolver({ Redirect: RedirectEntity, RedirectInput });
    const PaginatedPageTreeNodes = PaginatedPageTreeNodesFactory.create({ PageTreeNode });
    const PageTreeResolver = createPageTreeResolver({
        PageTreeNode,
        Documents: [Page],
        PaginatedPageTreeNodes,
    }); // no scope
    const PageTreeDependentsResolver = DependentsResolverFactory.create(PageTreeNode);

    const AuthResolver = createAuthResolver({});
    const RedirectsDependenciesResolver = DependenciesResolverFactory.create(RedirectEntity);

    const Folder = createFolderEntity();
    const File = createFileEntity({ Folder });
    const FileDependentsResolver = DependentsResolverFactory.create(File);

    // Required to force the generation of the FileUpload type in the schema
    @Resolver(() => FileUpload)
    class MockFileUploadResolver {
        @Query(() => FileUpload)
        fileUploadForTypesGenerationDoNotUse(): void {
            // Noop
        }
    }

    registerEnumType(CombinedPermission, { name: "Permission" });

    const schema = await gqlSchemaFactory.create([
        BuildsResolver,
        BuildTemplatesResolver,
        redirectsResolver,
        createDamItemsResolver({ File, Folder }),
        createFilesResolver({ File, Folder }),
        FileLicensesResolver,
        FileImagesResolver,
        createFoldersResolver({ Folder }),
        PageTreeResolver,
        CronJobsResolver,
        JobsResolver,
        AuthResolver,
        RedirectsDependenciesResolver,
        PageTreeDependentsResolver,
        FileDependentsResolver,
        UserResolver,
        UserPermissionResolver,
        UserContentScopesResolver,
        MockFileUploadResolver,
        AzureAiTranslatorResolver,
        GenerateAltTextResolver,
        GenerateImageTitleResolver,
        GenerateSeoTagsResolver,
        FileUploadsResolver,
        SitePreviewResolver,
        WarningResolver,
        createDamMediaAlternativeResolver({ File }),
        FullTextSearchResolver,
    ]);

    await writeFile("schema.gql", printSchema(schema));

    console.log("Done!");
}

generateSchema();
