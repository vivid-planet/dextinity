import { BrevoModule } from "@dextinity/brevo-api";
import {
    AccessLogModule,
    AzureAiTranslatorModule,
    AzureOpenAiContentGenerationModule,
    BlobStorageModule,
    BlocksModule,
    BlocksTransformerMiddlewareFactory,
    BuildsModule,
    ContentGenerationModule,
    CronJobsModule,
    DamModule,
    DependenciesModule,
    FileUploadsModule,
    FullTextSearchModule,
    ImgproxyModule,
    KubernetesModule,
    MailerModule,
    MailTemplatesModule,
    PageTreeModule,
    RedirectsModule,
    SentryModule,
    UserPermissionsModule,
    WarningsModule,
} from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ApolloDriver, type ApolloDriverConfig, ValidationError } from "@nestjs/apollo";
import { type DynamicModule, Module } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { type Enhancer, GraphQLModule } from "@nestjs/graphql";
import { AppPermission } from "@src/auth/app-permission.enum.js";
import { BlacklistedContacts } from "@src/brevo/blacklisted-contacts/entity/blacklisted-contacts.entity.js";
import { BrevoContactSubscribeModule } from "@src/brevo/brevo-contact/brevo-contact-subscribe.module.js";
import { BrevoContactAttributes, BrevoContactFilterAttributes } from "@src/brevo/brevo-contact/dto/brevo-contact-attributes.js";
import { BrevoEmailImportLog } from "@src/brevo/brevo-email-import-log/entity/brevo-email-import-log.entity.js";
import { BrevoTransactionalMailsModule } from "@src/brevo/brevo-transactional-mails/brevo-transactional-mails.module.js";
import { EmailCampaignContentBlock } from "@src/brevo/email-campaign/blocks/email-campaign-content.block.js";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope.js";
import { EmailCampaign } from "@src/brevo/email-campaign/entities/email-campaign.entity.js";
import { TargetGroup } from "@src/brevo/target-group/entity/target-group.entity.js";
import type { Config } from "@src/config/config.js";
import { ConfigModule } from "@src/config/config.module.js";
import { ContentGenerationService } from "@src/content-generation/content-generation.service.js";
import { DbModule } from "@src/db/db.module.js";
import { LinksModule } from "@src/documents/links/links.module.js";
import { PagesModule } from "@src/documents/pages/pages.module.js";
import { TranslationModule } from "@src/translation/translation.module.js";
import type { Request } from "express";

import { AccessControlService } from "./auth/access-control.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { SYSTEM_USER_NAME } from "./auth/constants.js";
import { UserService } from "./auth/user.service.js";
import { DamScope } from "./dam/dto/dam-scope.js";
import { DamFile } from "./dam/entities/dam-file.entity.js";
import { DamFolder } from "./dam/entities/dam-folder.entity.js";
import { Link } from "./documents/links/entities/link.entity.js";
import { Page } from "./documents/pages/entities/page.entity.js";
import { PredefinedPage } from "./documents/predefined-pages/entities/predefined-page.entity.js";
import { PredefinedPagesModule } from "./documents/predefined-pages/predefined-pages.module.js";
import { FooterModule } from "./footer/footer.module.js";
import { MenusModule } from "./menus/menus.module.js";
import { NewsLinkBlock } from "./news/blocks/news-link.block.js";
import { News } from "./news/entities/news.entity.js";
import { NewsModule } from "./news/news.module.js";
import { OpenTelemetryModule } from "./open-telemetry/open-telemetry.module.js";
import { PageTreeNodeCreateInput, PageTreeNodeUpdateInput } from "./page-tree/dto/page-tree-node.input.js";
import { PageTreeNodeScope } from "./page-tree/dto/page-tree-node-scope.js";
import { PageTreeNode } from "./page-tree/entities/page-tree-node.entity.js";
import { ProductsModule } from "./products/products.module.js";
import { RedirectScope } from "./redirects/dto/redirect-scope.js";
import { RedirectTargetUrlService } from "./redirects/redirect-target-url.service.js";
import { StatusModule } from "./status/status.module.js";
import { WelcomeEmailModule } from "./welcome-email/welcome-email.module.js";

@Module({})
export class AppModule {
    static forRoot(config: Config): DynamicModule {
        const authModule = AuthModule.forRoot(config);

        return {
            module: AppModule,
            imports: [
                ConfigModule.forRoot(config),
                TranslationModule,
                DbModule,
                GraphQLModule.forRootAsync<ApolloDriverConfig>({
                    driver: ApolloDriver,
                    imports: [BlocksModule],
                    useFactory: (moduleRef: ModuleRef) => ({
                        debug: config.debug,
                        graphiql: config.debug ? { url: "/api/graphql" } : undefined,
                        playground: false,
                        autoSchemaFile: "schema.gql",
                        sortSchema: true,
                        formatError: (error) => {
                            // Disable GraphQL field suggestions in production
                            if (process.env.NODE_ENV !== "development") {
                                if (error.extensions?.code === "GRAPHQL_VALIDATION_FAILED") {
                                    return new ValidationError("Invalid request.");
                                }
                            }
                            return error;
                        },
                        context: ({ req }: { req: Request }) => ({ ...req }),
                        cors: {
                            origin: config.corsAllowedOrigin,
                            methods: ["GET", "POST"],
                            credentials: false,
                            maxAge: 600,
                        },
                        useGlobalPrefix: true,
                        buildSchemaOptions: {
                            fieldMiddleware: [BlocksTransformerMiddlewareFactory.create(moduleRef)],
                        },
                        // See https://docs.nestjs.com/graphql/other-features#execute-enhancers-at-the-field-resolver-level
                        fieldResolverEnhancers: ["guards", "interceptors", "filters"] as Enhancer[],
                    }),
                    inject: [ModuleRef],
                }),
                authModule,
                UserPermissionsModule.forRootAsync({
                    useFactory: (userService: UserService, accessControlService: AccessControlService) => ({
                        availableContentScopes: config.siteConfigs.flatMap((siteConfig) =>
                            siteConfig.scope.languages.map((language) => ({
                                scope: { domain: siteConfig.scope.domain, language },
                                label: { domain: siteConfig.name },
                            })),
                        ),
                        availableContentScopeDimensions: [
                            { name: "domain", label: "Domain (Website)" },
                            { name: "language", label: "Language" },
                            // "product" is declared here so it shows up in the admin panel although it is not part of availableContentScopes
                            { name: "product", label: "Product Category" },
                        ],
                        userService,
                        accessControlService,
                        systemUsers: [SYSTEM_USER_NAME],
                    }),
                    inject: [UserService, AccessControlService],
                    imports: [authModule],
                    AppPermission,
                }),
                BlocksModule,
                DependenciesModule,
                KubernetesModule.register({
                    helmRelease: config.helmRelease,
                }),
                BuildsModule,
                LinksModule,
                PagesModule,
                PageTreeModule.forRoot({
                    PageTreeNode: PageTreeNode,
                    PageTreeNodeCreateInput: PageTreeNodeCreateInput,
                    PageTreeNodeUpdateInput: PageTreeNodeUpdateInput,
                    Documents: [Page, Link, PredefinedPage],
                    Scope: PageTreeNodeScope,
                    reservedPaths: ["/events"],
                    // change sitePreviewSecret based on scope
                    // this is just to demonstrate you can use the scope to change the sitePreviewSecret but it has no effect in this example
                    // if you only have one secret you can also just provide a string here
                    sitePreviewSecret: (scope) => {
                        if (scope.domain === "main") {
                            return config.sitePreviewSecret;
                        }
                        return config.sitePreviewSecret;
                    },
                    fullText: true,
                }),

                RedirectsModule.register({
                    imports: [MikroOrmModule.forFeature([News]), PredefinedPagesModule],
                    customTargets: { news: NewsLinkBlock },
                    Scope: RedirectScope,
                    TargetUrlService: RedirectTargetUrlService,
                }),
                BlobStorageModule.register({
                    backend: config.blob.storage,
                    cacheDirectory: `${config.blob.storageDirectoryPrefix}-cache`,
                }),
                ImgproxyModule.register(config.imgproxy),
                DamModule.register({
                    damConfig: {
                        secret: config.dam.secret,
                        allowedImageSizes: config.dam.allowedImageSizes,
                        allowedAspectRatios: config.dam.allowedImageAspectRatios,
                        filesDirectory: `${config.blob.storageDirectoryPrefix}-files`,
                        maxFileSize: config.dam.uploadsMaxFileSize,
                        maxSrcResolution: config.dam.maxSrcResolution,
                    },
                    Scope: DamScope,
                    File: DamFile,
                    Folder: DamFolder,
                }),
                StatusModule,
                FileUploadsModule.register({
                    maxFileSize: config.fileUploads.maxFileSize,
                    directory: `${config.blob.storageDirectoryPrefix}-file-uploads`,
                    acceptedMimeTypes: [
                        "application/pdf",
                        "application/x-zip-compressed",
                        "application/zip",
                        "image/png",
                        "image/jpeg",
                        "image/gif",
                        "image/webp",
                        "text/csv",
                    ],
                    upload: {
                        public: true,
                    },
                    download: { public: true, ...config.fileUploads.download },
                }),
                ...(config.contentGeneration
                    ? [
                          ContentGenerationModule.register({
                              Service: ContentGenerationService,
                              imports: [AzureOpenAiContentGenerationModule.register(config.contentGeneration)],
                          }),
                      ]
                    : []),
                NewsModule,
                MenusModule,
                FooterModule,
                WelcomeEmailModule,
                PredefinedPagesModule,
                CronJobsModule,
                MailerModule.register(config.mailer),
                MailTemplatesModule,
                ProductsModule,
                ...(config.azureAiTranslator ? [AzureAiTranslatorModule.register(config.azureAiTranslator)] : []),
                ...(!config.debug
                    ? [
                          AccessLogModule.forRoot({
                              shouldLogRequest: ({ req }) => !req.route.path.startsWith("/api/healthcheck/"),
                          }),
                      ]
                    : []),
                OpenTelemetryModule,
                ...(config.sentry ? [SentryModule.forRootAsync(config.sentry)] : []),
                WarningsModule,
                FullTextSearchModule,
                BrevoModule.register({
                    brevo: {
                        resolveConfig: (scope: EmailCampaignContentScope) => {
                            // change config based on scope - for example different sender email
                            // this is just to show you can use the scope to change the config but it has no real use in this example
                            const siteConfig = config.siteConfigs.find((siteConfig) => siteConfig.scope.domain == scope.domain);
                            if (!siteConfig) {
                                throw Error("Invalid scope passed");
                            }
                            return {
                                apiKey: config.brevo.apiKey,
                                redirectUrlForImport: siteConfig.url,
                            };
                        },
                        BlacklistedContacts,
                        BrevoContactAttributes,
                        BrevoContactFilterAttributes,
                        EmailCampaign,
                        TargetGroup,
                        BrevoEmailImportLog,
                    },
                    contactsWithoutDoi: {
                        allowAddingContactsWithoutDoi: config.brevo.contactsWithoutDoi.allowAddingContactsWithoutDoi,
                        emailHashKey: config.brevo.contactsWithoutDoi.emailHashKey,
                    },
                    ecgRtrList: {
                        apiKey: config.brevo.ecgRtrList.apiKey,
                    },
                    emailCampaigns: {
                        EmailCampaignContentBlock,
                        Scope: EmailCampaignContentScope,
                        frontend: (scope: EmailCampaignContentScope) => {
                            const siteConfig = config.siteConfigs.find((sc) => sc.scope.domain === scope.domain);
                            if (!siteConfig) {
                                throw new Error(`No site config found for scope ${scope.domain}`);
                            }
                            return {
                                url: `${siteConfig.url}/api/render-brevo-email-campaign`,
                                basicAuth: {
                                    username: config.brevo.campaign.basicAuth.username,
                                    password: config.brevo.campaign.basicAuth.password,
                                },
                            };
                        },
                    },
                }),
                BrevoContactSubscribeModule,
                BrevoTransactionalMailsModule,
            ],
        };
    }
}
