import {
    AffectedEntity,
    BuildsService,
    type ContentScope,
    PAGE_TREE_CONFIG,
    type PageTreeConfig,
    type PageTreeNodeInterface,
    PageTreeNodeVisibility,
    type PageTreeReadApi,
    PageTreeService,
    PageTreeSlugAvailability,
    RequiredPermission,
} from "@dextinity/cms-api";
import { BadRequestException, Inject, Injectable, NotFoundException, UseFilters, UseGuards } from "@nestjs/common";
import { Tool } from "@nestjs/mcp";
import { PageTreeNodeCreateInput, PageTreeNodeUpdateInput } from "@src/page-tree/dto/page-tree-node.input.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category.js";
import { UserGroup } from "@src/user-groups/user-group.js";
import { z } from "zod";

import { NotFoundFilter } from "./not-found.filter.js";
import { RefusalReasonFilter } from "./refusal-reason.filter.js";
import { pageTreeScopeSchema } from "./scope.schemas.js";
import { SignedInUserGuard } from "./signed-in-user.guard.js";
import { validateInput } from "./validate-input.js";

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

type PageTreeScope = z.infer<typeof pageTreeScopeSchema>;

const pageTreeNodeIdSchema = z.uuid().describe("The page tree node ID");
const slugSchema = z.string().describe('URL slug of the node, unique among its siblings, e.g. "about-us"');

const checkSlugAvailabilityParameters = z.object({
    scope: pageTreeScopeSchema,
    parentId: z.uuid().optional().describe("ID of the parent node, left out for a node at the root of the page tree"),
    slug: slugSchema,
});

const createPageTreeNodeParameters = z.object({
    scope: pageTreeScopeSchema,
    category: z.enum(PageTreeNodeCategory).default(PageTreeNodeCategory.mainNavigation).describe("The page tree the node is added to"),
    name: z.string().describe("Name of the node, shown in the menus of the site"),
    slug: slugSchema,
    documentType: z.enum(["Page", "Link", "PredefinedPage"]).default("Page").describe("Type of the document the node shows"),
    parentId: z.uuid().optional().describe("ID of the parent node, left out for a node at the root of the page tree"),
    pos: z.number().int().min(1).optional().describe("Position among its siblings, starting at 1, left out to add the node as the last one"),
    hideInMenu: z.boolean().optional().describe("Whether the node is hidden in the menus of the site"),
    userGroup: z.enum(UserGroup).default(UserGroup.all).describe("The users the node is shown to"),
});

const updatePageTreeNodeParameters = z.object({
    id: pageTreeNodeIdSchema,
    name: z.string().optional().describe("New name of the node, left out to keep it"),
    slug: slugSchema.optional().describe("New slug of the node, left out to keep it"),
    hideInMenu: z.boolean().optional().describe("Whether the node is hidden in the menus of the site, left out to keep it"),
    userGroup: z.enum(UserGroup).optional().describe("The users the node is shown to, left out to keep it"),
    createAutomaticRedirectsOnSlugChange: z
        .boolean()
        .default(true)
        .describe("Whether a changed slug adds redirects from the old paths of the node and its descendants"),
});

const updatePageTreeNodeVisibilityParameters = z.object({
    id: pageTreeNodeIdSchema,
    visibility: z.enum(PageTreeNodeVisibility).describe("Published shows the node on the site, Unpublished hides it, Archived also locks it"),
});

const deletePageTreeNodeParameters = z.object({
    id: pageTreeNodeIdSchema,
});

const refusedChangeReason = "You may not change the page tree of this scope.";

function slugNotAvailableError(slug: string, slugAvailability: PageTreeSlugAvailability): BadRequestException {
    return new BadRequestException(
        `The slug "${slug}" is ${slugAvailability.toLowerCase()}. Use check_slug_availability to find one that is available.`,
    );
}

@Injectable()
@RequiredPermission("pageTree")
@UseGuards(SignedInUserGuard)
export class PageTreeTools {
    constructor(
        private readonly pageTreeService: PageTreeService,
        // Marks the scope of a change as changed since the last build, as `ChangesCheckerInterceptor` does for a GraphQL
        // mutation only.
        private readonly buildsService: BuildsService,
        @Inject(PAGE_TREE_CONFIG) private readonly pageTreeConfig: PageTreeConfig,
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
        name: "check_slug_availability",
        description: `Check whether a slug can be used for a new page tree node under a parent node.
Answers "Available", "Taken" when a published or unpublished node already has the path, or "Reserved" when the path is reserved for the site or the slug is "home" anywhere but at the root.`,
        inputSchema: checkSlugAvailabilityParameters,
        annotations: { readOnlyHint: true },
    })
    @UseFilters(new RefusalReasonFilter(refusedChangeReason))
    async checkSlugAvailability({ scope, parentId, slug }: z.infer<typeof checkSlugAvailabilityParameters>) {
        if (parentId) {
            await this.getParentNodeInScope(parentId, scope);
        }

        return { availability: await this.pageTreeService.getSlugAvailability({ scope, parentId: parentId ?? null, slug }) };
    }

    @Tool({
        name: "create_page_tree_node",
        description: `Create a page tree node. It is created unpublished, except a node with the slug "home" at the root; use update_page_tree_node_visibility to publish it.
Use check_slug_availability first to find a slug that isn't taken.
The node has no document yet: for a node of document type "Page", save its first content with save_page, passing the returned "id" as "pageTreeNodeId" and null as "lastUpdatedAt".`,
        inputSchema: createPageTreeNodeParameters,
        annotations: { readOnlyHint: false },
    })
    @UseFilters(new RefusalReasonFilter(refusedChangeReason))
    async createPageTreeNode({ scope, category, documentType, ...parameters }: z.infer<typeof createPageTreeNodeParameters>) {
        if (parameters.parentId) {
            const parentNode = await this.getParentNodeInScope(parameters.parentId, scope);
            if (parentNode.visibility === PageTreeNodeVisibility.Archived) {
                throw new BadRequestException("An archived page tree node can't get child nodes.");
            }
        }

        const input = await validateInput({ ...parameters, attachedDocument: { type: documentType } }, PageTreeNodeCreateInput);
        const slugAvailability = await this.pageTreeService.getSlugAvailability({ scope, parentId: input.parentId ?? null, slug: input.slug });
        if (slugAvailability !== PageTreeSlugAvailability.Available) {
            throw slugNotAvailableError(input.slug, slugAvailability);
        }

        const node = await this.pageTreeService.createNode(input, category, scope);
        await this.buildsService.setChangesSinceLastBuild(scope);
        if (input.pos !== undefined) {
            await this.pageTreeService.updateNodePosition(node.id, { parentId: node.parentId, pos: input.pos });
        }

        return this.toChangedNode(node.id);
    }

    @Tool({
        name: "update_page_tree_node",
        description: `Change the name, slug, menu visibility or user group of a page tree node. Fields left out keep their value.
A changed slug changes the paths of the node and its descendants; by default, redirects from the old paths are added. The slug of the node "home" can't be changed.`,
        inputSchema: updatePageTreeNodeParameters,
        annotations: { readOnlyHint: false },
    })
    @AffectedEntity(PageTreeNode)
    @UseFilters(new NotFoundFilter("page tree node"))
    async updatePageTreeNode({ id, ...parameters }: z.infer<typeof updatePageTreeNodeParameters>) {
        const node = (await this.getNode(id)) as PageTreeNode;
        if (node.visibility === PageTreeNodeVisibility.Archived) {
            throw new BadRequestException(`The page tree node ${id} is archived and can't be changed. Publish or unpublish it first.`);
        }
        if (node.slug === "home" && parameters.slug !== undefined && parameters.slug !== "home") {
            throw new BadRequestException('The slug of the page tree node "home" can\'t be changed.');
        }

        const input = await validateInput(
            {
                name: parameters.name ?? node.name,
                slug: parameters.slug ?? node.slug,
                hideInMenu: parameters.hideInMenu ?? node.hideInMenu,
                userGroup: parameters.userGroup ?? node.userGroup,
                createAutomaticRedirectsOnSlugChange: parameters.createAutomaticRedirectsOnSlugChange,
            },
            PageTreeNodeUpdateInput,
        );
        if (input.slug !== node.slug) {
            const slugAvailability = await this.pageTreeService.getSlugAvailability({
                scope: node.scope,
                parentId: node.parentId ?? null,
                slug: input.slug,
            });
            if (slugAvailability !== PageTreeSlugAvailability.Available) {
                throw slugNotAvailableError(input.slug, slugAvailability);
            }
        }

        await this.pageTreeService.updateNode(id, input);
        await this.buildsService.setChangesSinceLastBuild(node.scope as ContentScope);

        return this.toChangedNode(id);
    }

    @Tool({
        name: "update_page_tree_node_visibility",
        description: `Publish, unpublish, archive or restore a page tree node.
An archived node and its page can't be changed until it is published or unpublished again; if its slug was taken in the meantime, a number is added to it. The node "home" stays published.`,
        inputSchema: updatePageTreeNodeVisibilityParameters,
        annotations: { readOnlyHint: false },
    })
    @AffectedEntity(PageTreeNode)
    @UseFilters(new NotFoundFilter("page tree node"))
    async updatePageTreeNodeVisibility({ id, visibility }: z.infer<typeof updatePageTreeNodeVisibilityParameters>) {
        // Not refused for an archived node, as the updatePageTreeNodeVisibility mutation doesn't: this is how it is restored.
        const node = await this.getNode(id);
        if (node.slug === "home" && visibility !== PageTreeNodeVisibility.Published) {
            throw new BadRequestException('The page tree node "home" must stay published.');
        }

        await this.pageTreeService.updateNodeVisibility(id, visibility);
        await this.buildsService.setChangesSinceLastBuild(node.scope as ContentScope);

        return this.toChangedNode(id);
    }

    @Tool({
        name: "delete_page_tree_node",
        description: `Delete a page tree node for good, together with all its descendants and the documents attached to them. This can't be undone; to take a page off the site and keep it, archive it with update_page_tree_node_visibility instead.
The node "home" can't be deleted.`,
        inputSchema: deletePageTreeNodeParameters,
        annotations: { readOnlyHint: false, destructiveHint: true },
    })
    @AffectedEntity(PageTreeNode)
    @UseFilters(new NotFoundFilter("page tree node"))
    async deletePageTreeNode({ id }: z.infer<typeof deletePageTreeNodeParameters>) {
        const node = await this.getNode(id);
        if (!this.pageTreeConfig.allowPageDelete) {
            throw new BadRequestException("Deleting page tree nodes is turned off; archive the node with update_page_tree_node_visibility instead.");
        }
        if (node.slug === "home") {
            throw new BadRequestException('The page tree node "home" can\'t be deleted.');
        }

        if (!(await this.pageTreeService.delete(node))) {
            throw new BadRequestException(`The page tree node ${id} couldn't be deleted.`);
        }
        await this.buildsService.setChangesSinceLastBuild(node.scope as ContentScope);

        return { deleted: id };
    }

    // `@AffectedEntity` has found the node and checked its scope.
    private async getNode(id: string): Promise<PageTreeNodeInterface> {
        return this.pageTreeService.createReadApi({ visibility: "all" }).getNodeOrFail(id);
    }

    // Not a permission check, which `@RequiredPermission` makes for the scope. `PageTreeService` refuses a parent of
    // another scope too, but not an unknown one, and its message would reveal that the node exists in another scope.
    private async getParentNodeInScope(id: string, scope: PageTreeScope): Promise<PageTreeNodeInterface> {
        const node = await this.pageTreeService.createReadApi({ visibility: "all" }).getNode(id);
        const nodeScope = node?.scope as PageTreeScope | undefined;
        if (!node || nodeScope?.domain !== scope.domain || nodeScope.language !== scope.language) {
            throw new NotFoundException(`There is no page tree node ${id} in this scope.`);
        }
        return node;
    }

    private async toChangedNode(id: string) {
        const readApi = this.createReadApi();
        return this.toNode(readApi, await readApi.getNodeOrFail(id));
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
