import {
    AffectedEntity,
    BlocksTransformerService,
    type PageTreeNodeInterface,
    type PageTreeReadApi,
    PageTreeService,
    RequiredPermission,
} from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException, UseFilters, UseGuards } from "@nestjs/common";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { REQUEST_CONTEXT_ID } from "@nestjs/core/router/request/request-constants.js";
import { Tool } from "@nestjs/mcp";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category.js";
import { z } from "zod";

import { NotFoundFilter, pageTreeScopeSchema, RefusalReasonFilter, SignedInUserGuard } from "./mcp-tool.utils.js";

const listPageTreeNodesParameters = z.object({
    scope: pageTreeScopeSchema,
    category: z.enum(PageTreeNodeCategory).optional().describe("Only return the nodes of this category"),
    documentType: z.string().optional().describe('Only return the nodes of this document type, e.g. "Page" or "Link"'),
    limit: z.number().int().min(1).max(500).default(100).describe("Max number of nodes to return, at most 500"),
    offset: z.number().int().min(0).default(0).describe("Offset for pagination"),
});

const getPageTreeNodeParameters = z.object({
    id: z.uuid().describe("The page tree node ID"),
});

const getPageTreeNodeByPathParameters = z.object({
    scope: pageTreeScopeSchema,
    path: z.string().describe('The URL path, e.g. "/about" or "/products/widget"'),
});

const getPageParameters = z.object({
    id: z.uuid().describe('The page document ID, which a page tree node of document type "Page" names as "documentId"'),
});

const refusedScopeReason = "You may not read the page tree of this scope.";

// As cms-admin's `includeInvisibleContentContext` sets them.
const adminRequestHeaders = {
    "x-include-invisible-content": "Pages:Unpublished,Pages:Archived,Blocks:Invisible",
    "x-preview-dam-urls": "1",
};

@Injectable()
@RequiredPermission("pageTree")
@UseGuards(SignedInUserGuard)
export class PageTreeTools {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
        private readonly moduleRef: ModuleRef,
    ) {}

    @Tool({
        name: "list_page_tree_nodes",
        description: `List the page tree nodes of a scope.
Returns per node its id, name, slug, path, visibility (Published, Unpublished or Archived), document type, parent id, category, and whether it is hidden in the menu, plus the total count.
Use get_page_tree_node with a returned id for the node's children and attached document.`,
        inputSchema: listPageTreeNodesParameters,
        annotations: { readOnlyHint: true },
    })
    @UseFilters(new RefusalReasonFilter(refusedScopeReason))
    async listPageTreeNodes({ scope, category, documentType, limit, offset }: z.infer<typeof listPageTreeNodesParameters>) {
        const readApi = this.createReadApi();
        await readApi.preloadNodes(scope);
        const nodes = await readApi.getNodes({ scope, category, documentType, offset, limit });
        const totalCount = await readApi.getNodesCount({ scope, category, documentType });

        return { nodes: await Promise.all(nodes.map((node) => this.toNode(readApi, node))), totalCount };
    }

    @Tool({
        name: "get_page_tree_node",
        description: `Get a page tree node by ID, with its path, its parent nodes, its child nodes, and the ID of its attached document ("documentId").
For a node of document type "Page", pass the "documentId" to get_page for the page's content.`,
        inputSchema: getPageTreeNodeParameters,
        annotations: { readOnlyHint: true },
    })
    @AffectedEntity(PageTreeNode)
    @UseFilters(new NotFoundFilter("page tree node"))
    async getPageTreeNode({ id }: z.infer<typeof getPageTreeNodeParameters>) {
        const readApi = this.createReadApi();
        const node = await readApi.getNode(id);
        if (!node) {
            throw new NotFoundException(`There is no page tree node ${id}.`);
        }

        return this.toNodeWithRelations(readApi, node);
    }

    @Tool({
        name: "get_page_tree_node_by_path",
        description: `Get the page tree node at a URL path of a scope, with the same details as get_page_tree_node.`,
        inputSchema: getPageTreeNodeByPathParameters,
        annotations: { readOnlyHint: true },
    })
    @UseFilters(new RefusalReasonFilter(refusedScopeReason))
    async getPageTreeNodeByPath({ scope, path }: z.infer<typeof getPageTreeNodeByPathParameters>) {
        const readApi = this.createReadApi();
        const node = await readApi.getNodeByPath(path, { scope });
        if (!node) {
            throw new NotFoundException(`There is no page tree node at ${path} in this scope.`);
        }

        return this.toNodeWithRelations(readApi, node);
    }

    @Tool({
        name: "get_page",
        description: `Get a page by its document ID, as it was last saved: the blocks of its content, stage, and SEO as JSON, and the page tree node it is attached to.
The content is the "PageContent" block, the stage the "Stage" block, and the SEO the "Seo" block; get_block_schema describes them and the blocks they hold.`,
        inputSchema: getPageParameters,
        annotations: { readOnlyHint: true },
    })
    @AffectedEntity(Page)
    @UseFilters(new NotFoundFilter("page"))
    async getPage({ id }: z.infer<typeof getPageParameters>) {
        const page = await this.entityManager.findOne(Page, id);
        const readApi = this.createReadApi();
        const node = page ? await readApi.getFirstNodeByAttachedPageId(page.id) : null;
        if (!page || !node) {
            throw new NotFoundException(`There is no page ${id}.`);
        }

        const blocksTransformer = await this.resolveBlocksTransformer();

        return {
            id: page.id,
            pageTreeNode: { id: node.id, name: node.name, path: await readApi.nodePath(node), visibility: node.visibility },
            content: await blocksTransformer.transformToPlain(page.content),
            stage: await blocksTransformer.transformToPlain(page.stage),
            seo: await blocksTransformer.transformToPlain(page.seo),
            updatedAt: page.updatedAt,
        };
    }

    // The agent works on the admin's page tree, which shows unpublished and archived nodes too.
    private createReadApi(): PageTreeReadApi {
        return this.pageTreeService.createReadApi({ visibility: "all" });
    }

    private async toNode(readApi: PageTreeReadApi, node: PageTreeNodeInterface) {
        const { userGroup } = node as PageTreeNode;

        return {
            id: node.id,
            name: node.name,
            slug: node.slug,
            path: await readApi.nodePath(node),
            visibility: node.visibility,
            documentType: node.documentType,
            parentId: node.parentId,
            category: node.category,
            hideInMenu: node.hideInMenu,
            userGroup,
        };
    }

    private async toNodeWithRelations(readApi: PageTreeReadApi, node: PageTreeNodeInterface) {
        const document = await this.pageTreeService.getActiveAttachedDocument(node.id, node.documentType);

        return {
            ...(await this.toNode(readApi, node)),
            scope: node.scope,
            documentId: document?.documentId ?? null,
            parentNodes: (await readApi.parentNodes(node)).map(({ id, name, slug }) => ({ id, name, slug })),
            childNodes: await Promise.all((await readApi.getChildNodes(node)).map((childNode) => this.toNode(readApi, childNode))),
        };
    }

    /**
     * `BlocksTransformerService` and the services of the block transformers, such as the `PageTreeReadApiService` an
     * internal link resolves its target with, are request-scoped and read their context from the headers of the
     * GraphQL request. `@nestjs/mcp` only serves tools of singleton providers, so they can't be injected into this
     * class. Each call gets its own instance, as each GraphQL request does, resolved with the headers of the admin's
     * requests: the page as its editor sees it, with hidden blocks, unpublished and archived link targets, and DAM
     * URLs that work before the page is published.
     */
    private async resolveBlocksTransformer(): Promise<BlocksTransformerService> {
        const contextId = ContextIdFactory.create();
        // `BlocksTransformerService` resolves the services of the block transformers under the context ID it finds on
        // the request, as the GraphQL module puts it there. Without it, they would get a new context without this request.
        const request = { req: { headers: adminRequestHeaders }, [REQUEST_CONTEXT_ID]: contextId };
        this.moduleRef.registerRequestByContextId(request, contextId);
        return this.moduleRef.resolve(BlocksTransformerService, contextId, { strict: false });
    }
}
