import "reflect-metadata";

export { AccessLogModule } from "./access-log/access-log.module.js";
export { DisableDextinityGuards } from "./auth/decorators/disable-dextinity-guards.decorator.js";
export { GetCurrentUser } from "./auth/decorators/get-current-user.decorator.js";
export { DextinityAuthGuard } from "./auth/guards/dextinity.guard.js";
export { createAuthResolver } from "./auth/resolver/auth.resolver.js";
export { createBasicAuthService } from "./auth/services/basic.auth-service.js";
export { createJwtAuthService, type JwtPayload, type JwtToUserServiceInterface } from "./auth/services/jwt.auth-service.js";
export { createSitePreviewAuthService } from "./auth/services/site-preview.auth-service.js";
export { createStaticUserAuthService } from "./auth/services/static-authed-user.auth-service.js";
export { createAuthGuardProviders } from "./auth/util/auth-guard.providers.js";
export type { AuthServiceInterface } from "./auth/util/auth-service.interface.js";
export type { BlobStorageBackendInterface, CreateFileOptions, StorageMetaData } from "./blob-storage/backends/blob-storage-backend.interface.js";
export { BlobStorageBackendService } from "./blob-storage/backends/blob-storage-backend.service.js";
export type { BlobStorageConfig } from "./blob-storage/blob-storage.config.js";
export { BlobStorageModule } from "./blob-storage/blob-storage.module.js";
export { ScaledImagesCacheService } from "./blob-storage/cache/scaled-images-cache.service.js";
export {
    type Block,
    type BlockContext,
    BlockData,
    type BlockDataFactory,
    type BlockDataInterface,
    type BlockIndexData,
    BlockInput,
    type BlockInputFactory,
    type BlockInputInterface,
    blockInputToData,
    type BlockMetaField,
    BlockMetaFieldKind,
    type BlockMetaInterface,
    type BlockMetaLiteralFieldKind,
    type BlockTransformerServiceInterface,
    type BlockWarning,
    type ChildBlockInfo,
    createBlock,
    type ExtractBlockData,
    type ExtractBlockInput,
    type ExtractBlockInputFactoryProps,
    isBlockDataInterface,
    isBlockInputInterface,
    type SimpleBlockInputInterface,
    type TransformBlockResponse,
    type TransformBlockResponseArray,
    transformToBlockSave,
    type TraversableTransformBlockResponse,
    type TraversableTransformBlockResponseArray,
} from "./blocks/block.js";
export { BlocksModule } from "./blocks/blocks.module.js";
export { getBlocksMeta } from "./blocks/blocks-meta.js";
export { BlocksTransformerService } from "./blocks/blocks-transformer.service.js";
export { BlocksTransformerMiddlewareFactory } from "./blocks/blocks-transformer-middleware.factory.js";
export { ChildBlock } from "./blocks/decorators/child-block.js";
export { ChildBlockInput } from "./blocks/decorators/child-block-input.js";
export { AnnotationBlockMeta, BlockField } from "./blocks/decorators/field.js";
export { RootBlock } from "./blocks/decorators/root-block.js";
export { RootBlockEntity } from "./blocks/decorators/root-block-entity.js";
export { EmailLinkBlock } from "./blocks/email-link.block.js";
export { ExternalLinkBlock } from "./blocks/externalLink/external-link.block.js";
export { ColumnsBlockFactory } from "./blocks/factories/columns-block.factory.js";
export {
    BaseBlocksBlockItemData,
    BaseBlocksBlockItemInput,
    type BlocksBlockFixturesGeneratorMap,
    type BlocksBlockInputInterface,
    createBlocksBlock,
} from "./blocks/factories/createBlocksBlock.js";
export { createImageLinkBlock } from "./blocks/factories/createImageLinkBlock.js";
export { createLinkBlock } from "./blocks/factories/createLinkBlock.js";
export { BaseListBlockItemData, BaseListBlockItemInput, createListBlock } from "./blocks/factories/createListBlock.js";
export {
    BaseOneOfBlockData,
    BaseOneOfBlockInput,
    BaseOneOfBlockItemData,
    BaseOneOfBlockItemInput,
    createOneOfBlock,
    type CreateOneOfBlockOptions,
    type OneOfBlock,
} from "./blocks/factories/createOneOfBlock.js";
export { createOptionalBlock, type OptionalBlockInputInterface } from "./blocks/factories/createOptionalBlock.js";
export { createRichTextBlock } from "./blocks/factories/createRichTextBlock.js";
export { createSeoBlock, type SeoBlockInputInterface, SitemapPageChangeFrequency, SitemapPagePriority } from "./blocks/factories/createSeoBlock.js";
export { createSpaceBlock } from "./blocks/factories/createSpaceBlock.js";
export { createTableBlock } from "./blocks/factories/createTableBlock.js";
export { createTextImageBlock, ImagePosition } from "./blocks/factories/createTextImageBlock.js";
export { createTextLinkBlock } from "./blocks/factories/createTextLinkBlock.js";
export type { BlockFactoryNameOrOptions } from "./blocks/factories/types.js";
export { FlatBlocks } from "./blocks/flat-blocks/flat-blocks.js";
export {
    getMostSignificantPreviewImageUrlTemplateFromBlock,
    getPreviewImageUrlTemplatesFromBlock,
} from "./blocks/get-preview-image-url-templates.js";
export { composeBlocks } from "./blocks/helpers/composeBlocks.js";
export { strictBlockDataFactoryDecorator } from "./blocks/helpers/strictBlockDataFactoryDecorator.js";
export { strictBlockInputFactoryDecorator } from "./blocks/helpers/strictBlockInputFactoryDecorator.js";
export { BlockMigration } from "./blocks/migrations/BlockMigration.js";
export { BlockDataMigrationVersion } from "./blocks/migrations/decorators/BlockDataMigrationVersion.js";
export type { BlockMigrationInterface } from "./blocks/migrations/types.js";
export { typeSafeBlockMigrationPipe } from "./blocks/migrations/typeSafeBlockMigrationPipe.js";
export { PhoneLinkBlock } from "./blocks/phone-link.block.js";
export { RootBlockType } from "./blocks/root-block-type.js";
export { RootBlockDataScalar } from "./blocks/rootBlocks/root-block-data.scalar.js";
export { RootBlockInputScalar } from "./blocks/rootBlocks/root-block-input.scalar.js";
export { blockToMikroOrmFullText, getSearchTextFromBlock, type SearchText, type WeightedSearchText } from "./blocks/search/get-search-text.js";
export {
    createTipTapRichTextBlock,
    type CreateTipTapRichTextBlockOptions,
    type TipTapRichTextBlockContent,
} from "./blocks/tipTap/createTipTapRichTextBlock.js";
export { transformToBlockSaveIndex } from "./blocks/transformToBlockSaveIndex/transformToBlockSaveIndex.js";
export { IsLinkTarget } from "./blocks/validator/is-link-target.validator.js";
export { VimeoVideoBlock } from "./blocks/vimeo-video.block.js";
export { YouTubeVideoBlock } from "./blocks/YouTubeVideoBlock/you-tube-video.block.js";
export { BUILDS_CONFIG, BUILDS_MODULE_OPTIONS } from "./builds/builds.constants.js";
export { BuildsModule } from "./builds/builds.module.js";
export { BuildsResolver } from "./builds/builds.resolver.js";
export { BuildsService } from "./builds/builds.service.js";
export { AutoBuildStatus } from "./builds/dto/auto-build-status.object.js";
export { ChangesSinceLastBuild } from "./builds/entities/changes-since-last-build.entity.js";
export { SKIP_BUILD_METADATA_KEY, SkipBuild } from "./builds/skip-build.decorator.js";
export {
    CRUD_GENERATOR_METADATA_KEY,
    CRUD_SINGLE_GENERATOR_METADATA_KEY,
    CrudField,
    type CrudFieldOptions,
    CrudGenerator,
    type CrudGeneratorHooksService,
    type CrudGeneratorOptions,
    CrudSingleGenerator,
    type CrudSingleGeneratorOptions,
} from "./common/decorators/crud-generator.decorator.js";
export { getRequestContextHeadersFromRequest, RequestContext, type RequestContextInterface } from "./common/decorators/request-context.decorator.js";
export { getRequestFromExecutionContext } from "./common/decorators/utils.js";
export { CorePermission } from "./common/enum/core-permission.enum.js";
export { DextinityException } from "./common/errors/dextinity.exception.js";
export { DextinityEntityNotFoundException } from "./common/errors/entity-not-found.exception.js";
export { ExceptionFilter } from "./common/errors/exception.filter.js";
export { ExceptionInterceptor } from "./common/errors/exception.interceptor.js";
export { DextinityValidationException } from "./common/errors/validation.exception.js";
export { ValidationExceptionFactory } from "./common/errors/validation.exception-factory.js";
export { BooleanFilter } from "./common/filter/boolean.filter.js";
export { DateFilter } from "./common/filter/date.filter.js";
export { DateTimeFilter } from "./common/filter/date-time.filter.js";
export { createEnumFilter } from "./common/filter/enum.filter.factory.js";
export { createEnumsFilter } from "./common/filter/enums.filter.factory.js";
export { IdFilter } from "./common/filter/id.filter.js";
export { ManyToManyFilter } from "./common/filter/many-to-many.filter.js";
export { ManyToOneFilter } from "./common/filter/many-to-one.filter.js";
export { filtersToMikroOrmQuery, gqlArgsToMikroOrmQuery, gqlSortToMikroOrmOrderBy, searchToMikroOrmQuery } from "./common/filter/mikro-orm.js";
export { NumberFilter } from "./common/filter/number.filter.js";
export { OneToManyFilter } from "./common/filter/one-to-many.filter.js";
export { StringFilter } from "./common/filter/string.filter.js";
export { extractGraphqlFields } from "./common/graphql/extract-graphql-fields.js";
export type { MutationError } from "./common/graphql/mutation-error.js";
export { CdnGuard } from "./common/guards/cdn.guard.js";
export { type CrudSearchField, getCrudSearchFieldsFromMetadata, hasCrudFieldFeature } from "./common/helper/crud-generator.helper.js";
export { PartialType } from "./common/helper/partial-type.helper.js";
export { OffsetBasedPaginationArgs } from "./common/pagination/offset-based.args.js";
export { PaginatedResponseFactory } from "./common/pagination/paginated-response.factory.js";
export { SortArgs } from "./common/sorting/sort.args.js";
export { SortDirection } from "./common/sorting/sort-direction.enum.js";
export { IsNullable } from "./common/validators/is-nullable.js";
export { IsPhoneNumber, isPhoneNumber } from "./common/validators/is-phone-number.js";
export { IsSlug } from "./common/validators/is-slug.js";
export { IsUndefinable } from "./common/validators/is-undefinable.js";
export { AzureOpenAiContentGenerationModule } from "./content-generation/azure-open-ai/azure-open-ai-content-generation.module.js";
export {
    type AzureOpenAiConfig,
    AzureOpenAiContentGenerationService,
    type AzureOpenAiContentGenerationServiceConfig,
} from "./content-generation/azure-open-ai/azure-open-ai-content-generation.service.js";
export { ContentGenerationModule } from "./content-generation/content-generation.module.js";
export type { ContentGenerationServiceInterface } from "./content-generation/content-generation-service.interface.js";
export { CronJobsModule } from "./cron-jobs/cron-jobs.module.js";
export { DamFileDownloadLinkBlock } from "./dam/blocks/dam-file-download-link.block.js";
export { DamImageBlock } from "./dam/blocks/dam-image.block.js";
export { PixelImageBlock } from "./dam/blocks/pixel-image.block.js";
export { SvgImageBlock } from "./dam/blocks/svg-image.block.js";
export { DamVideoBlock } from "./dam/blocks/video/dam-video.block.js";
export { DextinityImageResolutionException } from "./dam/common/errors/image-resolution.exception.js";
export { damDefaultAcceptedMimetypes } from "./dam/common/mimeTypes/dam-default-accepted-mimetypes.js";
export { type DamFileCategory, getDamFileCategory } from "./dam/common/mimeTypes/dam-file-category.js";
export type { DamConfig } from "./dam/dam.config.js";
export { DAM_CONFIG } from "./dam/dam.constants.js";
export { DamModule } from "./dam/dam.module.js";
export { DamFilesModule } from "./dam/dam-files.module.js";
export { CreateFileInput, ImageFileInput, UpdateFileInput } from "./dam/files/dto/file.input.js";
export { CreateFolderInput, UpdateFolderInput } from "./dam/files/dto/folder.input.js";
export { DamFileAiContentType } from "./dam/files/entities/ai-content-type.enum.js";
export { createFileEntity, type FileInterface } from "./dam/files/entities/file.entity.js";
export { DamFileImage } from "./dam/files/entities/file-image.entity.js";
export { createFolderEntity, type FolderInterface } from "./dam/files/entities/folder.entity.js";
export { FilesService } from "./dam/files/files.service.js";
export { FoldersService } from "./dam/files/folders.service.js";
export type { ImageInterface } from "./dam/images/dto/image.interface.js";
export { HashImageParams, ImageParams } from "./dam/images/dto/image.params.js";
export { ImageCropAreaInput } from "./dam/images/dto/image-crop-area.input.js";
export { ImageCropArea } from "./dam/images/entities/image-crop-area.entity.js";
export { FileImagesResolver } from "./dam/images/file-image.resolver.js";
export { ImagesService } from "./dam/images/images.service.js";
export { calculateInheritAspectRatio } from "./dam/images/images.util.js";
export { IsAllowedImageAspectRatio, IsAllowedImageAspectRatioConstraint } from "./dam/images/validators/is-allowed-aspect-ratio.validator.js";
export { IsAllowedImageSize, IsAllowedImageSizeConstraint } from "./dam/images/validators/is-allowed-image-size.validator.js";
export { IsValidImageAspectRatio, IsValidImageAspectRatioConstraint } from "./dam/images/validators/is-valid-aspect-ratio.validator.js";
export { DependenciesModule } from "./dependencies/dependencies.module.js";
export { DependenciesResolverFactory } from "./dependencies/dependencies.resolver.factory.js";
export { DependenciesService } from "./dependencies/dependencies.service.js";
export { DependentsResolverFactory } from "./dependencies/dependents.resolver.factory.js";
export type { BaseDependencyInterface } from "./dependencies/dto/base-dependency.interface.js";
export { Dependency } from "./dependencies/dto/dependency.js";
export { DocumentInterface } from "./document/dto/document-interface.js";
export type { SaveDocument } from "./document/dto/save-document.js";
export { validateNotModified } from "./document/validateNotModified.js";
export { EntityInfo, type EntityInfoSql } from "./entity-info/entity-info.decorator.js";
export { EntityInfoObject } from "./entity-info/entity-info.object.js";
export { FileUpload } from "./file-uploads/entities/file-upload.entity.js";
export { FileUploadsModule } from "./file-uploads/file-uploads.module.js";
export { FileUploadsService } from "./file-uploads/file-uploads.service.js";
export type { FileUploadInput, FileUploadInterface } from "./file-utils/file-upload.input.js";
export { createFileUploadInputFromUrl, slugifyFilename } from "./file-utils/files.utils.js";
export { FocalPoint } from "./file-utils/focal-point.enum.js";
export { getCenteredPosition, getMaxDimensionsFromArea, type ImageDimensionsAndCoordinates } from "./file-utils/images.util.js";
export { PaginatedEntityInfo } from "./full-text-search/dto/paginated-entity-info.js";
export { EntityInfoFullTextObject } from "./full-text-search/entities/entity-info-full-text.object.js";
export { FullTextSearchModule } from "./full-text-search/full-text-search.module.js";
export { IMGPROXY_CONFIG } from "./imgproxy/imgproxy.constants.js";
export { Extension, Gravity, ResizingType } from "./imgproxy/imgproxy.enum.js";
export { ImgproxyModule } from "./imgproxy/imgproxy.module.js";
export { type ImgproxyConfig, ImgproxyService } from "./imgproxy/imgproxy.service.js";
export { ImporterDataStream } from "./importer/data-streams/data-stream.js";
export { ImporterLocalFileDataStream } from "./importer/data-streams/local-file-data-stream.js";
export { CsvColumn, CsvColumnType } from "./importer/decorators/csv-column.decorator.js";
export type { ImportTargetInterface } from "./importer/import-target.interface.js";
export type { ImporterInputClass } from "./importer/importer-input.type.js";
export { ImporterEndPipe } from "./importer/pipes/end.pipe.js";
export type { ImporterPipe } from "./importer/pipes/importer-pipe.type.js";
export { ImporterCsvParseAndTransformPipes } from "./importer/pipes/parsers/csv-parser-and-transform.composite-pipe.js";
export { KubernetesJobStatus } from "./kubernetes/job-status.enum.js";
export { KubernetesModule } from "./kubernetes/kubernetes.module.js";
export { KubernetesService } from "./kubernetes/kubernetes.service.js";
export { MailTemplate, type MailTemplateInterface, type PreparedTestProps } from "./mail-templates/mail-template.decorator.js";
export { MailTemplateService } from "./mail-templates/mail-template.service.js";
export { MailTemplatesModule } from "./mail-templates/mail-templates.module.js";
export { MailerLog } from "./mailer/entities/mailer-log.entity.js";
export { MAILER_SERVICE_CONFIG } from "./mailer/mailer.constants.js";
export { MailerModule, type MailerModuleConfig } from "./mailer/mailer.module.js";
export { MailerService, type SendMailParams } from "./mailer/mailer.service.js";
export { entityToMikroOrmFullText } from "./mikro-orm/helper/entity-to-mikro-orm-full-text.js";
export { resolveEntityClass } from "./mikro-orm/helper/resolve-entity-class.js";
export { createMigrationsList, createOrmConfig, MikroOrmModule, type MikroOrmModuleOptions } from "./mikro-orm/mikro-orm.module.js";
export { AttachedDocumentLoaderService } from "./page-tree/attached-document-loader.service.js";
export { AnchorBlock } from "./page-tree/blocks/anchor.block.js";
export { InternalLinkBlock } from "./page-tree/blocks/internal-link.block.js";
export { createPageTreeResolver } from "./page-tree/createPageTreeResolver.js";
export { AttachedDocumentInput, AttachedDocumentStrictInput } from "./page-tree/dto/attached-document.input.js";
export { EmptyPageTreeNodeScope } from "./page-tree/dto/empty-page-tree-node-scope.js";
export {
    MovePageTreeNodesByNeighbourInput,
    MovePageTreeNodesByPosInput,
    PageTreeNodeBaseCreateInput,
    PageTreeNodeBaseUpdateInput,
    PageTreeNodeUpdateVisibilityInput,
} from "./page-tree/dto/page-tree-node.input.js";
export { PaginatedPageTreeNodesFactory } from "./page-tree/dto/paginated-page-tree-nodes.factory.js";
export { AttachedDocument } from "./page-tree/entities/attached-document.entity.js";
export { PageTreeNodeBase } from "./page-tree/entities/page-tree-node-base.entity.js";
export { PageTreeModule } from "./page-tree/page-tree.module.js";
export { type PageTreeReadApi, PageTreeService } from "./page-tree/page-tree.service.js";
export { PageTreeNodeDocumentEntityScopeService } from "./page-tree/page-tree-node-document-entity-scope.service.js";
export { PageTreeReadApiService } from "./page-tree/page-tree-read-api.service.js";
export { type PageTreeNodeCategory, type PageTreeNodeInterface, PageTreeNodeVisibility, type ScopeInterface } from "./page-tree/types.js";
export { PageExists, PageExistsConstraint } from "./page-tree/validators/page-exists.validator.js";
export type { RedirectInterface } from "./redirects/entities/redirect-entity.factory.js";
export type { RedirectTargetUrlServiceInterface } from "./redirects/redirect-target-url.service.js";
export { REDIRECTS_LINK_BLOCK } from "./redirects/redirects.constants.js";
export { RedirectGenerationType, RedirectSourceType } from "./redirects/redirects.enum.js";
export { type RedirectsLinkBlock, RedirectsModule } from "./redirects/redirects.module.js";
export { createRedirectsResolver } from "./redirects/redirects.resolver.js";
export { RedirectsService } from "./redirects/redirects.service.js";
export { IsValidRedirectSource, IsValidRedirectSourceConstraint } from "./redirects/validators/isValidRedirectSource.js";
export { SentryModule } from "./sentry/sentry.module.js";
export { AzureAiTranslatorModule } from "./translation/azure-ai-translator.module.js";
export { AbstractAccessControlService } from "./user-permissions/access-control.service.js";
export { AffectedEntity, type AffectedEntityMeta, type AffectedEntityOptions } from "./user-permissions/decorators/affected-entity.decorator.js";
export { AffectedScope } from "./user-permissions/decorators/affected-scope.decorator.js";
export {
    DisablePermissionCheck,
    REQUIRED_PERMISSION_METADATA_KEY,
    RequiredPermission,
    type RequiredPermissionMetadata,
} from "./user-permissions/decorators/required-permission.decorator.js";
export { SCOPED_ENTITY_METADATA_KEY, ScopedEntity, type ScopedEntityMeta } from "./user-permissions/decorators/scoped-entity.decorator.js";
export { CurrentUser } from "./user-permissions/dto/current-user.js";
export { CurrentUserPermission } from "./user-permissions/dto/current-user.js";
export { FindUsersArgs } from "./user-permissions/dto/paginated-user-list.js";
export type { ContentScope } from "./user-permissions/interfaces/content-scope.interface.js";
export type { User } from "./user-permissions/interfaces/user.js";
export { UserPermissionsModule } from "./user-permissions/user-permissions.module.js";
export { UserPermissionsPublicService as UserPermissionsService } from "./user-permissions/user-permissions.public.service.js";
export type { ContentScopeDimension, ContentScopeWithLabel } from "./user-permissions/user-permissions.types.js";
export { CombinedPermission, registerAdditionalPermissions } from "./user-permissions/user-permissions.types.js";
export {
    type AccessControlServiceInterface,
    type ContentScopesForUser,
    type Permission,
    type PermissionForUser,
    type PermissionOverrides,
    type PermissionsForUser,
    UserPermissions,
    type UserPermissionsUserServiceInterface,
    type Users,
} from "./user-permissions/user-permissions.types.js";
export { CreateWarnings } from "./warnings/decorators/create-warnings.decorator.js";
export { WarningsModule } from "./warnings/warning.module.js";
