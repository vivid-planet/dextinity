import { AffectedEntity, BlocksTransformerService, PageTreeService, RequiredPermission } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException, UseFilters, UseGuards } from "@nestjs/common";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { REQUEST_CONTEXT_ID } from "@nestjs/core/router/request/request-constants.js";
import { Tool } from "@nestjs/mcp";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { z } from "zod";

import { NotFoundFilter } from "./not-found.filter.js";
import { SignedInUserGuard } from "./signed-in-user.guard.js";

const getPageParameters = z.object({
    id: z.uuid().describe('The page document ID, which a page tree node of document type "Page" names as "documentId"'),
});

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
        private readonly moduleRef: ModuleRef,
    ) {}

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
