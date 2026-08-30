import { BrevoModule } from "@comet/brevo-api";
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
    ImgproxyModule,
    KubernetesModule,
    MailerModule,
    MailTemplatesModule,
    PageTreeModule,
    RedirectsModule,
    SentryModule,
    UserPermissionsModule,
    WarningsModule,
} from "@comet/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ApolloDriver, ApolloDriverConfig, ValidationError } from "@nestjs/apollo";
import { DynamicModule, Module } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Enhancer, GraphQLModule } from "@nestjs/graphql";
import { AppPermission } from "@src/auth/app-permission.enum";
import { BlacklistedContacts } from "@src/brevo/blacklisted-contacts/entity/blacklisted-contacts.entity";
import { BrevoContactSubscribeModule } from "@src/brevo/brevo-contact/brevo-contact-subscribe.module";
import { BrevoContactAttributes, BrevoContactFilterAttributes } from "@src/brevo/brevo-contact/dto/brevo-contact-attributes";
import { BrevoEmailImportLog } from "@src/brevo/brevo-email-import-log/entity/brevo-email-import-log.entity";
import { BrevoTransactionalMailsModule } from "@src/brevo/brevo-transactional-mails/brevo-transactional-mails.module";
import { EmailCampaignContentBlock } from "@src/brevo/email-campaign/blocks/email-campaign-content.block";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope";
import { EmailCampaign } from "@src/brevo/email-campaign/entities/email-campaign.entity";
import { TargetGroup } from "@src/brevo/target-group/entity/target-group.entity";
import { Config } from "@src/config/config";
import { ConfigModule } from "@src/config/config.module";
import { ContentGenerationService } from "@src/content-generation/content-generation.service";
import { DbModule } from "@src/db/db.module";
import { LinksModule } from "@src/documents/links/links.module";
import { PagesModule } from "@src/documents/pages/pages.module";
import { TranslationModule } from "@src/translation/translation.module";
import { Request } from "express";

import { AccessControlService } from "./auth/access-control.service";
import { AuthModule, SYSTEM_USER_NAME } from "./auth/auth.module";
import { UserService } from "./auth/user.service";
import { DamScope } from "./dam/dto/dam-scope";
import { DamFile } from "./dam/entities/dam-file.entity";
import { DamFolder } from "./dam/entities/dam-folder.entity";
import { Link } from "./documents/links/entities/link.entity";
import { Page } from "./documents/pages/entities/page.entity";
import { PredefinedPage } from "./documents/predefined-pages/entities/predefined-page.entity";
import { PredefinedPagesModule } from "./documents/predefined-pages/predefined-pages.module";
import { FooterModule } from "./footer/footer.module";
import { MenusModule } from "./menus/menus.module";
import { NewsLinkBlock } from "./news/blocks/news-link.block";
import { News } from "./news/entities/news.entity";
import { NewsModule } from "./news/news.module";
import { OpenTelemetryModule } from "./open-telemetry/open-telemetry.module";
import { PageTreeNodeCreateInput, PageTreeNodeUpdateInput } from "./page-tree/dto/page-tree-node.input";
import { PageTreeNodeScope } from "./page-tree/dto/page-tree-node-scope";
import { PageTreeNode } from "./page-tree/entities/page-tree-node.entity";
import { ProductsModule } from "./products/products.module";
import { RedirectScope } from "./redirects/dto/redirect-scope";
import { RedirectTargetUrlService } from "./redirects/redirect-target-url.service";
import { StatusModule } from "./status/status.module";

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
                        // Generate ~2000 content scopes across 4 dimensions (domain × language × organization × country)
                        // to test behavior with a large number of scopes. 2 domains × 2 languages × 25 organizations × 20 countries = 2000.
                        availableContentScopes: config.siteConfigs.flatMap((siteConfig) =>
                            siteConfig.scope.languages.flatMap((language) =>
                                Array.from({ length: 25 }, (_, orgIndex) => `organization-${orgIndex + 1}`).flatMap((organization) =>
                                    Array.from({ length: 20 }, (_, countryIndex) => `country-${countryIndex + 1}`).map((country) => ({
                                        scope: { domain: siteConfig.scope.domain, language, organization, country },
                                        label: { domain: siteConfig.name },
                                    })),
                                ),
                            ),
                        ),
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
                PredefinedPagesModule,
                CronJobsModule,
                MailerModule.register(config.mailer),
                MailTemplatesModule,
                ProductsModule,
                ...(config.azureAiTranslator ? [AzureAiTranslatorModule.register(config.azureAiTranslator)] : []),
                AccessLogModule.forRoot({
                    shouldLogRequest: ({ user }) => {
                        // Ignore system user
                        if (user === "system-user") {
                            return false;
                        }
                        return true;
                    },
                }),
                OpenTelemetryModule,
                ...(config.sentry ? [SentryModule.forRootAsync(config.sentry)] : []),
                WarningsModule,
                BrevoModule.register({
                    brevo: {
                        resolveConfig: (scope: EmailCampaignContentScope) => {
                            // change config based on scope - for example different sender email
                            // this is just to show you can use the scope to change the config but it has no real use in this example
                            if (scope.domain === "main") {
                                return {
                                    apiKey: config.brevo.apiKey,
                                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                                };
                            } else if (scope.domain === "secondary") {
                                return {
                                    apiKey: config.brevo.apiKey,
                                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                                };
                            }

                            throw Error("Invalid scope passed");
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
                                url: `${siteConfig.url}/${scope.language}/render-brevo-email-campaign`,
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
