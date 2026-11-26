import { AffectedEntity, type PageTreeNodeInterface, type PageTreeReadApi, PageTreeService, RequiredPermission } from "@dextinity/cms-api";
import { Injectable, NotFoundException, UseFilters, UseGuards } from "@nestjs/common";
import { Tool } from "@nestjs/mcp";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category.js";
import { z } from "zod";

import { NotFoundFilter } from "./not-found.filter.js";
import { RefusalReasonFilter } from "./refusal-reason.filter.js";
import { pageTreeScopeSchema } from "./scope.schemas.js";
import { SignedInUserGuard } from "./signed-in-user.guard.js";

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

const refusedScopeReason = "You may not read the page tree of this scope.";

@Injectable()
@RequiredPermission("pageTree")
@UseGuards(SignedInUserGuard)
export class PageTreeTools {
    constructor(private readonly pageTreeService: PageTreeService) {}

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
}
