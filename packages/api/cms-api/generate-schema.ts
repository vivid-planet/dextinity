import { NestFactory } from "@nestjs/core";
import { Field, GraphQLSchemaBuilderModule, GraphQLSchemaFactory, ObjectType, Query, registerEnumType, Resolver } from "@nestjs/graphql";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";

import {
    BuildsResolver,
    CorePermission,
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
    PageTreeNodeCategory,
    PaginatedPageTreeNodesFactory,
} from "./src";
import { BuildTemplatesResolver } from "./src/builds/build-templates.resolver";
import { GenerateAltTextResolver } from "./src/content-generation/generate-alt-text.resolver";
import { GenerateImageTitleResolver } from "./src/content-generation/generate-image-title.resolver";
import { GenerateSeoTagsResolver } from "./src/content-generation/generate-seo-tags.resolver";
import { CronJobsResolver } from "./src/cron-jobs/cron-jobs.resolver";
import { DependencyResolver } from "./src/dependencies/dependency.resolver";
import { JobsResolver } from "./src/cron-jobs/jobs.resolver";
import { createDamItemsResolver } from "./src/dam/files/dam-items.resolver";
import { createDamMediaAlternativeResolver } from "./src/dam/files/dam-media-alternatives/dam-media-alternative.resolver";
import { createFileEntity } from "./src/dam/files/entities/file.entity";
import { createFolderEntity } from "./src/dam/files/entities/folder.entity";
import { FileLicensesResolver } from "./src/dam/files/file-licenses.resolver";
import { createFilesResolver } from "./src/dam/files/files.resolver";
import { createFoldersResolver } from "./src/dam/files/folders.resolver";
import { FileUploadsResolver } from "./src/file-uploads/file-uploads.resolver";
import { FullTextSearchResolver } from "./src/full-text-search/full-text-search.resolver";
import { SitePreviewResolver } from "./src/page-tree/site-preview.resolver";
import { RedirectInputFactory } from "./src/redirects/dto/redirect-input.factory";
import { RedirectEntityFactory } from "./src/redirects/entities/redirect-entity.factory";
import { AzureAiTranslatorResolver } from "./src/translation/azure-ai-translator.resolver";
import { UserResolver } from "./src/user-permissions/user.resolver";
import { UserContentScopesResolver } from "./src/user-permissions/user-content-scopes.resolver";
import { UserPermissionResolver } from "./src/user-permissions/user-permission.resolver";
import { WarningResolver } from "./src/warnings/warning.resolver";
import { CombinedPermission } from "./src/user-permissions/user-permissions.types";

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
        DependencyResolver,
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
