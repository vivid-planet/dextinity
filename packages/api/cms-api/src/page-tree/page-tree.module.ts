import { MikroOrmModule } from "@mikro-orm/nestjs";
import { type DynamicModule, Global, Module, type Type, type ValueProvider } from "@nestjs/common";

import { validateScopeTypeNames } from "../common/helper/scope-type-names.helper.js";
import { DependenciesResolverFactory } from "../dependencies/dependencies.resolver.factory.js";
import { DependentsResolverFactory } from "../dependencies/dependents.resolver.factory.js";
import type { DocumentInterface } from "../document/dto/document-interface.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import { AttachedDocumentLoaderService } from "./attached-document-loader.service.js";
import { InternalLinkBlockTransformerService } from "./blocks/internal-link-block-transformer.service.js";
import { InternalLinkBlockWarningsService } from "./blocks/internal-link-block-warnings.service.js";
import { createPageTreeResolver } from "./createPageTreeResolver.js";
import { DocumentSubscriberFactory } from "./document-subscriber.js";
import type { PageTreeNodeBaseCreateInput, PageTreeNodeBaseUpdateInput } from "./dto/page-tree-node.input.js";
import { PaginatedPageTreeNodesFactory } from "./dto/paginated-page-tree-nodes.factory.js";
import { AttachedDocument } from "./entities/attached-document.entity.js";
import type { PageTreeNodeBase } from "./entities/page-tree-node-base.entity.js";
import { createFullTextResolver } from "./fullText/createFullTextResolver.js";
import { PageTreeNodeFullText } from "./fullText/entities/page-tree-node-full-text.object.js";
import { PageTreeFullTextService } from "./fullText/page-tree-full-text.service.js";
import { defaultReservedPaths, PAGE_TREE_CONFIG, PAGE_TREE_DOCUMENTS, PAGE_TREE_ENTITY, SITE_PREVIEW_CONFIG } from "./page-tree.constants.js";
import { PageTreeService } from "./page-tree.service.js";
import { PageTreeNodeDocumentEntityScopeService } from "./page-tree-node-document-entity-scope.service.js";
import { PageTreeReadApiService } from "./page-tree-read-api.service.js";
import { SitePreviewResolver } from "./site-preview.resolver.js";
import type { ScopeInterface } from "./types.js";
import { PageExistsConstraint } from "./validators/page-exists.validator.js";

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
            validateScopeTypeNames(Scope, { label: "page tree", objectTypeName: "PageTreeNodeScope", inputTypeName: "PageTreeNodeScopeInput" });
        }

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
