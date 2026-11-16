import { BlocksTransformerService, type ContentScope, type PageTreeNodeInterface, type PageTreeReadApi, PageTreeService } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { UseInterceptors } from "@nestjs/common";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { Payload } from "@nestjs/microservices";
import { McpController, McpRawRequest, Tool } from "@rekog/mcp-nest";
import { AccessControlService } from "@src/auth/access-control.service.js";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import type { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category.js";
import { z } from "zod";

import { getUser, jsonResult, type McpRequest, pageTreeScopeSchema, ToolError } from "./mcp-tool.utils.js";
import { ToolErrorInterceptor } from "./tool-error.interceptor.js";

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

@McpController()
@UseInterceptors(ToolErrorInterceptor)
export class PageTreeTools {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
        private readonly accessControlService: AccessControlService,
        private readonly moduleRef: ModuleRef,
    ) {}

    @Tool({
        name: "list_page_tree_nodes",
        description: `List the page tree nodes of a scope.
Returns per node its id, name, slug, path, visibility (Published, Unpublished or Archived), document type, parent id, category, and whether it is hidden in the menu, plus the total count.
Use get_page_tree_node with a returned id for the node's children and attached document.`,
        parameters: listPageTreeNodesParameters,
        annotations: { readOnlyHint: true },
    })
    async listPageTreeNodes(
        @Payload() { scope, category, documentType, limit, offset }: z.infer<typeof listPageTreeNodesParameters>,
        @McpRawRequest() request: McpRequest,
    ) {
        // As `@RequiredPermission("pageTree")` checks the scope argument of the `paginatedPageTreeNodes` query.
        if (!this.accessControlService.isAllowed(getUser(request), "pageTree", scope)) {
            throw new ToolError("You may not read the page tree of this scope.");
        }

        const readApi = this.createReadApi();
        await readApi.preloadNodes(scope);
        const nodes = await readApi.getNodes({ scope, category, documentType, offset, limit });
        const totalCount = await readApi.getNodesCount({ scope, category, documentType });

        return jsonResult({ nodes: await Promise.all(nodes.map((node) => this.toNode(readApi, node))), totalCount });
    }

    @Tool({
        name: "get_page_tree_node",
        description: `Get a page tree node by ID, with its path, its parent nodes, its child nodes, and the ID of its attached document ("documentId").
For a node of document type "Page", pass the "documentId" to get_page for the page's content.`,
        parameters: getPageTreeNodeParameters,
        annotations: { readOnlyHint: true },
    })
    async getPageTreeNode(@Payload() { id }: z.infer<typeof getPageTreeNodeParameters>, @McpRawRequest() request: McpRequest) {
        const user = getUser(request);
        const readApi = this.createReadApi();
        const node = await readApi.getNode(id);
        // As `@AffectedEntity(PageTreeNode)` checks the scope of the node, with the same answer for a node the user may
        // not read as for one that doesn't exist.
        if (!node?.scope || !this.accessControlService.isAllowed(user, "pageTree", node.scope as ContentScope)) {
            throw new ToolError(`There is no page tree node ${id}.`);
        }

        return jsonResult(await this.toNodeWithRelations(readApi, node));
    }

    @Tool({
        name: "get_page_tree_node_by_path",
        description: `Get the page tree node at a URL path of a scope, with the same details as get_page_tree_node.`,
        parameters: getPageTreeNodeByPathParameters,
        annotations: { readOnlyHint: true },
    })
    async getPageTreeNodeByPath(@Payload() { scope, path }: z.infer<typeof getPageTreeNodeByPathParameters>, @McpRawRequest() request: McpRequest) {
        if (!this.accessControlService.isAllowed(getUser(request), "pageTree", scope)) {
            throw new ToolError("You may not read the page tree of this scope.");
        }

        const readApi = this.createReadApi();
        const node = await readApi.getNodeByPath(path, { scope });
        if (!node) {
            throw new ToolError(`There is no page tree node at ${path} in this scope.`);
        }

        return jsonResult(await this.toNodeWithRelations(readApi, node));
    }

    @Tool({
        name: "get_page",
        description: `Get a page by its document ID, as it was last saved: the blocks of its content, stage, and SEO as JSON, and the page tree node it is attached to.
The content is the "PageContent" block, the stage the "Stage" block, and the SEO the "Seo" block; get_block_schema describes them and the blocks they hold.`,
        parameters: getPageParameters,
        annotations: { readOnlyHint: true },
    })
    async getPage(@Payload() { id }: z.infer<typeof getPageParameters>, @McpRawRequest() request: McpRequest) {
        const user = getUser(request);
        const page = await this.entityManager.findOne(Page, id);
        const readApi = this.createReadApi();
        const node = page ? await readApi.getFirstNodeByAttachedPageId(page.id) : null;
        // As `@AffectedEntity(Page)` checks the scope of the node the page is attached to.
        if (!page || !node?.scope || !this.accessControlService.isAllowed(user, "pageTree", node.scope as ContentScope)) {
            throw new ToolError(`There is no page ${id}.`);
        }

        const blocksTransformer = await this.resolveBlocksTransformer();
        // As the admin's editor sees the page: hidden blocks included, and with DAM URLs that work before the page is
        // published.
        const blockContext = { includeInvisibleContent: true, previewDamUrls: true };

        return jsonResult({
            id: page.id,
            pageTreeNode: { id: node.id, name: node.name, path: await readApi.nodePath(node), visibility: node.visibility },
            content: await blocksTransformer.transformToPlain(page.content, blockContext),
            stage: await blocksTransformer.transformToPlain(page.stage, blockContext),
            seo: await blocksTransformer.transformToPlain(page.seo, blockContext),
            updatedAt: page.updatedAt,
        });
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
     * `BlocksTransformerService` reads its block context from the GraphQL request. Injected into this class, it would
     * get the request of the RPC pipeline instead, which has no headers, and fail to construct. Each call gets its own
     * instance, as each GraphQL request does, and passes the block context explicitly.
     */
    private async resolveBlocksTransformer(): Promise<BlocksTransformerService> {
        const contextId = ContextIdFactory.create();
        this.moduleRef.registerRequestByContextId({ req: { headers: {} } }, contextId);
        return this.moduleRef.resolve(BlocksTransformerService, contextId, { strict: false });
    }
}
