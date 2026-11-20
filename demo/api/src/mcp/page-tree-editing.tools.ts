import { randomUUID } from "node:crypto";

import {
    AffectedEntity,
    type BlockDataInterface,
    BuildsService,
    type ContentScope,
    PAGE_TREE_CONFIG,
    type PageTreeConfig,
    type PageTreeNodeInterface,
    PageTreeNodeVisibility,
    PageTreeService,
    PageTreeSlugAvailability,
    RequiredPermission,
    transformToBlockSave,
} from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UseFilters, UseGuards } from "@nestjs/common";
import { Tool } from "@nestjs/mcp";
import { PageInput } from "@src/documents/pages/dto/page.input.js";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PagesService } from "@src/documents/pages/pages.service.js";
import { PageTreeNodeCreateInput, PageTreeNodeUpdateInput } from "@src/page-tree/dto/page-tree-node.input.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category.js";
import { UserGroup } from "@src/user-groups/user-group.js";
import { isEqual } from "date-fns";
import { z } from "zod";

import { NotFoundFilter, pageTreeScopeSchema, RefusalReasonFilter, SignedInUserGuard, validateInput } from "./mcp-tool.utils.js";

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

const getPageInputParameters = z.object({
    pageTreeNodeId: z.uuid().describe('ID of the page tree node of document type "Page" the page is attached to'),
});

const savePageParameters = z.object({
    pageTreeNodeId: z.uuid().describe('ID of the page tree node of document type "Page" the page is attached to'),
    lastUpdatedAt: z.iso
        .datetime()
        .nullable()
        .describe('The "updatedAt" of the page as get_page_input returned it, null only for a node that has no saved page yet'),
    content: z.record(z.string(), z.unknown()).describe('The "PageContent" block, in the shape of its "inputFields"'),
    stage: z.record(z.string(), z.unknown()).describe('The "Stage" block, in the shape of its "inputFields"'),
    seo: z.record(z.string(), z.unknown()).describe('The "Seo" block, in the shape of its "inputFields"'),
});

const refusedScopeReason = "You may not change the page tree of this scope.";

function archivedNodeError(id: string): BadRequestException {
    return new BadRequestException(`The page tree node ${id} is archived and can't be changed. Publish or unpublish it first.`);
}

function slugNotAvailableError(slug: string, slugAvailability: PageTreeSlugAvailability): BadRequestException {
    return new BadRequestException(
        `The slug "${slug}" is ${slugAvailability.toLowerCase()}. Use check_slug_availability to find one that is available.`,
    );
}

// A block is saved in its input shape plus the versions of the block migrations it went through. Reading it doesn't
// validate it, though: stored data that doesn't match the block's current definition, e.g. a field it no longer has,
// is returned as it is, and save_page refuses it with the path of each such value.
function toBlockInput(block: BlockDataInterface): unknown {
    return withoutMigrationVersions(transformToBlockSave(block));
}

function withoutMigrationVersions(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(withoutMigrationVersions);
    }
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => key !== "$$version" && key !== "$$vendorVersion")
                .map(([key, entry]) => [key, withoutMigrationVersions(entry)]),
        );
    }
    return value;
}

// Each change marks its scope as changed since the last build, as `ChangesCheckerInterceptor` does for a GraphQL
// mutation only.
@Injectable()
@RequiredPermission("pageTree")
@UseGuards(SignedInUserGuard)
export class PageTreeEditingTools {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
        private readonly pagesService: PagesService,
        private readonly buildsService: BuildsService,
        @Inject(PAGE_TREE_CONFIG) private readonly pageTreeConfig: PageTreeConfig,
    ) {}

    @Tool({
        name: "check_slug_availability",
        description: `Check whether a slug can be used for a new page tree node under a parent node.
Answers "Available", "Taken" when a published or unpublished node already has the path, or "Reserved" when the path is reserved for the site or the slug is "home" anywhere but at the root.`,
        inputSchema: checkSlugAvailabilityParameters,
        annotations: { readOnlyHint: true },
    })
    @UseFilters(new RefusalReasonFilter(refusedScopeReason))
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
    @UseFilters(new RefusalReasonFilter(refusedScopeReason))
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

        return this.toNode(node.id);
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
            throw archivedNodeError(id);
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

        return this.toNode(id);
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

        return this.toNode(id);
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

    @Tool({
        name: "get_page_input",
        description: `Get the content, stage and SEO of the page attached to a page tree node in the shape save_page takes, together with the "updatedAt" save_page needs.
Unlike get_page, which shows the blocks as the site reads them, with link targets and DAM files resolved, the blocks come back as they are saved: links and images only name the IDs of their targets. Read a page with this tool before you change it with save_page.`,
        inputSchema: getPageInputParameters,
        annotations: { readOnlyHint: true },
    })
    @AffectedEntity(PageTreeNode, { idArg: "pageTreeNodeId" })
    @UseFilters(new NotFoundFilter("page tree node", "pageTreeNodeId"))
    async getPageInput({ pageTreeNodeId }: z.infer<typeof getPageInputParameters>) {
        const node = await this.getNode(pageTreeNodeId);
        const page = await this.findAttachedPage(node);
        if (!page) {
            throw new NotFoundException(
                `The page tree node ${pageTreeNodeId} has no saved page. Save its first content with save_page, passing null as "lastUpdatedAt".`,
            );
        }

        return {
            id: page.id,
            pageTreeNodeId: node.id,
            content: toBlockInput(page.content),
            stage: toBlockInput(page.stage),
            seo: toBlockInput(page.seo),
            updatedAt: page.updatedAt,
        };
    }

    @Tool({
        name: "save_page",
        description: `Save the content, stage and SEO of a page, replacing what was saved before.
Use it only for pages that are not open in the admin's page editor. For the page open in the editor, use the edit_blocks tool instead: its changes stay unsaved in the editor for the user to review, and a save_page call would be overwritten by the editor's next save.

Read the page with get_page_input first and pass its "updatedAt" as "lastUpdatedAt": the call is refused when the page was changed since, so that no one's changes are lost; read it again then and redo the change. For a page tree node that has no saved page yet, as after create_page_tree_node, pass null.

"content", "stage" and "seo" are the "PageContent", "Stage" and "Seo" blocks in the shape of their "inputFields", which get_block_schema describes along with the blocks they nest. get_page_input returns them in this shape: change what you need and pass all three back. A new block in a list needs a new "key" (a UUID), "visible", "type" and "props"; an existing block keeps its "key".
An invalid input is refused with the path and reason of each invalid value.`,
        inputSchema: savePageParameters,
        annotations: { readOnlyHint: false },
    })
    @AffectedEntity(PageTreeNode, { idArg: "pageTreeNodeId" })
    @UseFilters(new NotFoundFilter("page tree node", "pageTreeNodeId"))
    async savePage({ pageTreeNodeId, lastUpdatedAt, ...input }: z.infer<typeof savePageParameters>) {
        const node = await this.getNode(pageTreeNodeId);
        if (node.visibility === PageTreeNodeVisibility.Archived) {
            throw archivedNodeError(pageTreeNodeId);
        }
        if (node.documentType !== "Page") {
            throw new BadRequestException(`The page tree node ${pageTreeNodeId} is of document type "${node.documentType}", not "Page".`);
        }

        const page = await this.findAttachedPage(node);
        if (page) {
            if (lastUpdatedAt === null) {
                throw new ConflictException(
                    `The page tree node ${pageTreeNodeId} already has a saved page. Read it with get_page_input and pass its "updatedAt".`,
                );
            }
            if (!isEqual(page.updatedAt, new Date(lastUpdatedAt))) {
                throw new ConflictException(
                    "The page was changed since you read it. Read it again with get_page_input and redo your change on the new version.",
                );
            }
        }

        const pageInput = await validateInput(input, PageInput);
        const savedPage = await this.pagesService.savePage({
            pageId: page?.id ?? randomUUID(),
            input: pageInput,
            lastUpdatedAt: page?.updatedAt,
            attachedPageTreeNodeId: node.id,
        });
        await this.buildsService.setChangesSinceLastBuild(node.scope as ContentScope);

        return { id: savedPage.id, pageTreeNodeId: node.id, updatedAt: savedPage.updatedAt };
    }

    // `@AffectedEntity` has found the node and checked its scope.
    private async getNode(id: string): Promise<PageTreeNodeInterface> {
        return this.pageTreeService.createReadApi({ visibility: "all" }).getNodeOrFail(id);
    }

    // Not a permission check, which `@RequiredPermission` makes for the scope: a parent of another scope would put the
    // node into a tree it doesn't belong to.
    private async getParentNodeInScope(id: string, scope: PageTreeScope): Promise<PageTreeNodeInterface> {
        const node = await this.pageTreeService.createReadApi({ visibility: "all" }).getNode(id);
        const nodeScope = node?.scope as PageTreeScope | undefined;
        if (!node || nodeScope?.domain !== scope.domain || nodeScope.language !== scope.language) {
            throw new NotFoundException(`There is no page tree node ${id} in this scope.`);
        }
        return node;
    }

    // The page is looked up through the node, whose scope was checked, so a page ID of another scope can't be passed.
    private async findAttachedPage(node: PageTreeNodeInterface): Promise<Page | null> {
        const attachedDocument = await this.pageTreeService.getActiveAttachedDocument(node.id, "Page");
        return attachedDocument ? this.entityManager.findOne(Page, attachedDocument.documentId) : null;
    }

    private async toNode(id: string) {
        const readApi = this.pageTreeService.createReadApi({ visibility: "all" });
        const node = (await readApi.getNodeOrFail(id)) as PageTreeNode;

        return {
            id: node.id,
            name: node.name,
            slug: node.slug,
            path: await readApi.nodePath(node),
            visibility: node.visibility,
            documentType: node.documentType,
            parentId: node.parentId ?? null,
            pos: node.pos,
            category: node.category,
            hideInMenu: node.hideInMenu,
            userGroup: node.userGroup,
        };
    }
}
