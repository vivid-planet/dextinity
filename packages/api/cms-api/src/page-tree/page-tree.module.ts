import { MikroOrmModule } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { DynamicModule, Global, Module, Type, ValueProvider } from "@nestjs/common";
import { TypeMetadataStorage } from "@nestjs/graphql";

import { DependenciesResolverFactory } from "../dependencies/dependencies.resolver.factory";
import { DependentsResolverFactory } from "../dependencies/dependents.resolver.factory";
import { DocumentInterface } from "../document/dto/document-interface";
import { ContentScope } from "../user-permissions/interfaces/content-scope.interface";
import { AttachedDocumentLoaderService } from "./attached-document-loader.service";
import { InternalLinkBlockTransformerService } from "./blocks/internal-link-block-transformer.service";
import { InternalLinkBlockWarningsService } from "./blocks/internal-link-block-warnings.service";
import { createPageTreeResolver } from "./createPageTreeResolver";
import { DocumentSubscriberFactory } from "./document-subscriber";
import { PageTreeNodeBaseCreateInput, PageTreeNodeBaseUpdateInput } from "./dto/page-tree-node.input";
import { PaginatedPageTreeNodesFactory } from "./dto/paginated-page-tree-nodes.factory";
import { AttachedDocument } from "./entities/attached-document.entity";
import { PageTreeNodeBase } from "./entities/page-tree-node-base.entity";
import { createFullTextResolver } from "./fullText/createFullTextResolver";
import { PageTreeNodeFullText } from "./fullText/entities/page-tree-node-full-text.object";
import { PageTreeFullTextService } from "./fullText/page-tree-full-text.service";
import {
    defaultReservedPaths,
    PAGE_TREE_CONFIG,
    PAGE_TREE_DOCUMENTS,
    PAGE_TREE_ENTITY,
    PAGE_TREE_REPOSITORY,
    SITE_PREVIEW_CONFIG,
} from "./page-tree.constants";
import { PageTreeService } from "./page-tree.service";
import { PageTreeNodeDocumentEntityScopeService } from "./page-tree-node-document-entity-scope.service";
import { PageTreeReadApiService } from "./page-tree-read-api.service";
import { SitePreviewResolver } from "./site-preview.resolver";
import type { PageTreeNodeInterface, ScopeInterface } from "./types";
import { PageExistsConstraint } from "./validators/page-exists.validator";

export interface PageTreeConfig {
    reservedPaths: string[];
    /**
     * Controls whether deleting pages is allowed.
     * If set to `false`, delete mutations are blocked and pages can only be archived.
     */
    allowPageDelete: boolean;
}

interface PageTreeModuleOptions {
    PageTreeNode: Type<PageTreeNodeBase>;
    PageTreeNodeCreateInput?: Type<PageTreeNodeBaseCreateInput>;
    PageTreeNodeUpdateInput?: Type<PageTreeNodeBaseUpdateInput>;
    Documents: Type<DocumentInterface>[];
    Scope?: Type<ScopeInterface>;
    reservedPaths?: string[];
    /**
     * Controls whether deleting pages is allowed.
     * Defaults to `true`.
     */
    allowPageDelete?: boolean;
    sitePreviewSecret: string | ((scope: ContentScope) => string);
    fullText?: boolean;
}

@Global()
@Module({})
export class PageTreeModule {
    static forRoot(options: PageTreeModuleOptions): DynamicModule {
        const { Documents, Scope, PageTreeNode, PageTreeNodeCreateInput, PageTreeNodeUpdateInput, reservedPaths } = options;

        if (PageTreeNode.name !== PAGE_TREE_ENTITY) {
            throw new Error(`PageTreeModule: Your PageTreeNode entity must be named ${PAGE_TREE_ENTITY}`);
        }

        const PaginatedPageTreeNodes = PaginatedPageTreeNodesFactory.create({ PageTreeNode });
        const PageTreeResolver = createPageTreeResolver({
            PageTreeNode,
            Documents,
            Scope,
            PageTreeNodeCreateInput,
            PageTreeNodeUpdateInput,
            PaginatedPageTreeNodes,
        });
        const PageTreeDependentsResolver = DependentsResolverFactory.create(PageTreeNode);
        const PageTreeDependenciesResolver = DependenciesResolverFactory.create(PageTreeNode);

        const PageTreeFullTextResolver = options.fullText
            ? createFullTextResolver({
                  PageTreeNode,
                  Scope,
                  PaginatedPageTreeNodes,
              })
            : null;

        if (Scope) {
            // Scope validation needs to happen after resolver generation. Otherwise the input type metadata has not been defined yet.
            const scopeObjectType = TypeMetadataStorage.getObjectTypeMetadataByTarget(Scope);

            if (scopeObjectType?.name !== "PageTreeNodeScope") {
                throw new Error(
                    `Invalid object type name for provided page tree scope class. Make sure to decorate the class with @ObjectType("PageTreeNodeScope")`,
                );
            }

            const scopeInputType = TypeMetadataStorage.getInputTypeMetadataByTarget(Scope);

            if (scopeInputType?.name !== "PageTreeNodeScopeInput") {
                throw new Error(
                    `Invalid input type name for provided page tree scope class. Make sure to decorate the class with @InputType("PageTreeNodeScopeInput")`,
                );
            }
        }

        const repositoryProvider = {
            provide: PAGE_TREE_REPOSITORY,
            useFactory: async (em: EntityManager): Promise<EntityRepository<PageTreeNodeInterface>> => {
                return em.getRepository(PageTreeNode);
            },
            inject: [EntityManager],
        };

        const pageTreeConfigProvider: ValueProvider<PageTreeConfig> = {
            provide: PAGE_TREE_CONFIG,
            useValue: {
                reservedPaths: [...defaultReservedPaths, ...(reservedPaths ?? [])],
                allowPageDelete: options.allowPageDelete ?? true,
            },
        };

        const documentSubscriber = DocumentSubscriberFactory.create({ Documents });

        return {
            module: PageTreeModule,
            imports: [MikroOrmModule.forFeature([AttachedDocument, PageTreeNode, PageTreeNodeFullText, ...(Scope ? [Scope] : [])])],
            providers: [
                PageTreeService,
                PageTreeReadApiService,
                AttachedDocumentLoaderService,
                PageTreeResolver,
                PageTreeDependentsResolver,
                PageTreeDependenciesResolver,
                ...(PageTreeFullTextResolver ? [PageTreeFullTextResolver, PageTreeFullTextService] : []),
                repositoryProvider,
                pageTreeConfigProvider,
                {
                    provide: PageExistsConstraint,
                    useFactory: (pageTreeService: PageTreeService) => {
                        return new PageExistsConstraint(pageTreeService);
                    },
                    inject: [PageTreeService],
                },
                documentSubscriber,
                PageTreeNodeDocumentEntityScopeService,
                InternalLinkBlockTransformerService,
                InternalLinkBlockWarningsService,
                {
                    provide: PAGE_TREE_DOCUMENTS,
                    useValue: Documents,
                },
                {
                    provide: SITE_PREVIEW_CONFIG,
                    useValue: {
                        secret: options.sitePreviewSecret,
                    },
                },
                SitePreviewResolver,
            ],
            exports: [
                PageTreeService,
                PageTreeReadApiService,
                AttachedDocumentLoaderService,
                PageTreeNodeDocumentEntityScopeService,
                InternalLinkBlockTransformerService,
                ...(PageTreeFullTextResolver ? [PageTreeFullTextService] : []),
            ],
        };
    }
}
