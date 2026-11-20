import { randomUUID } from "node:crypto";

import {
    AffectedEntity,
    type BlockDataInterface,
    BlocksTransformerService,
    BuildsService,
    type ContentScope,
    type PageTreeNodeInterface,
    PageTreeNodeVisibility,
    PageTreeService,
    RequiredPermission,
    transformToBlockSave,
} from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { BadRequestException, ConflictException, Injectable, NotFoundException, UseFilters, UseGuards } from "@nestjs/common";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { REQUEST_CONTEXT_ID } from "@nestjs/core/router/request/request-constants.js";
import { Tool } from "@nestjs/mcp";
import { PageInput } from "@src/documents/pages/dto/page.input.js";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PagesService } from "@src/documents/pages/pages.service.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { isEqual } from "date-fns";
import { z } from "zod";

import { NotFoundFilter } from "./not-found.filter.js";
import { SignedInUserGuard } from "./signed-in-user.guard.js";
import { validateInput } from "./validate-input.js";

const getPageParameters = z.object({
    id: z.uuid().describe('The page document ID, which a page tree node of document type "Page" names as "documentId"'),
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

// As cms-admin's `includeInvisibleContentContext` sets them.
const adminRequestHeaders = {
    "x-include-invisible-content": "Pages:Unpublished,Pages:Archived,Blocks:Invisible",
    "x-preview-dam-urls": "1",
};

@Injectable()
@RequiredPermission("pageTree")
@UseGuards(SignedInUserGuard)
export class PageTools {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
        private readonly pagesService: PagesService,
        // Marks the scope of a change as changed since the last build, as `ChangesCheckerInterceptor` does for a GraphQL
        // mutation only.
        private readonly buildsService: BuildsService,
        private readonly moduleRef: ModuleRef,
    ) {}

    @Tool({
        name: "get_page",
        description: `Get a page by its document ID, as it was last saved: the blocks of its content, stage, and SEO as JSON, and the page tree node it is attached to.
The content is the "PageContent" block, the stage the "Stage" block, and the SEO the "Seo" block; get_block_schema describes them and the blocks they hold.
To change a page, read it with get_page_input instead, which returns the blocks in the shape save_page takes.`,
        inputSchema: getPageParameters,
        annotations: { readOnlyHint: true },
    })
    @AffectedEntity(Page)
    @UseFilters(new NotFoundFilter("page"))
    async getPage({ id }: z.infer<typeof getPageParameters>) {
        const page = await this.entityManager.findOne(Page, id);
        // The agent works on the admin's page tree, which shows unpublished and archived nodes too.
        const readApi = this.pageTreeService.createReadApi({ visibility: "all" });
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
            throw new BadRequestException(`The page tree node ${pageTreeNodeId} is archived and can't be changed. Publish or unpublish it first.`);
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

    // The page is looked up through the node, whose scope was checked, so a page ID of another scope can't be passed.
    private async findAttachedPage(node: PageTreeNodeInterface): Promise<Page | null> {
        const attachedDocument = await this.pageTreeService.getActiveAttachedDocument(node.id, "Page");
        return attachedDocument ? this.entityManager.findOne(Page, attachedDocument.documentId) : null;
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
