import {
    BlocksTransformerService,
    getRequestContextHeadersFromRequest,
    PageTreeNodeVisibility,
    PageTreeService,
    type RequestContextInterface,
} from "@dextinity/cms-api";
import { EntityManager, NotFoundError } from "@mikro-orm/postgresql";
import { Inject, Injectable, Logger, Scope } from "@nestjs/common";
import { CONTEXT } from "@nestjs/graphql";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import type { Request } from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { allowedScope, createMcpTestApp, createOrmProvider } from "./mcp.test-helper.js";

const transformedBlocks: { blockContext: unknown; requestContext: RequestContextInterface | undefined }[] = [];

// Stands in for the service of a block transformer, such as the `PageTreeReadApiService` an internal link resolves its
// target with: request-scoped, and reading its context off the request the real `BlocksTransformerService` resolves it
// under.
@Injectable({ scope: Scope.REQUEST })
class RequestScopedBlockTransformerService {
    private readonly requestContext?: RequestContextInterface;

    constructor(@Inject(CONTEXT) context: { req?: Request } | undefined) {
        this.requestContext = context?.req ? getRequestContextHeadersFromRequest(context.req) : undefined;
    }

    async transformToPlain(_block: unknown, blockContext: unknown) {
        transformedBlocks.push({ blockContext, requestContext: this.requestContext });
        return { transformed: true };
    }
}

const deletedNewsId = "0190a5f4-0000-7000-8000-000000000031";

// Stands in for the service of a block transformer that loads the target of a link, such as a news link to a deleted news entry.
@Injectable()
class DeletedLinkTargetBlockTransformerService {
    async transformToPlain() {
        throw NotFoundError.findOneFailed("News", deletedNewsId);
    }
}

function createBlockData(transformerService: unknown = RequestScopedBlockTransformerService) {
    return { transformToPlain: () => transformerService, transformToSave: () => ({}) };
}

const homeNode = { id: "0190a5f4-0000-7000-8000-000000000001", name: "Home", slug: "home", documentType: "Page", scope: allowedScope };
const otherScopeNode = {
    id: "0190a5f4-0000-7000-8000-000000000002",
    name: "Other",
    slug: "other",
    documentType: "Page",
    scope: { domain: "secondary", language: "en" },
};
const nodes = [homeNode, otherScopeNode];
const pages = [
    { id: "0190a5f4-0000-7000-8000-000000000011", node: homeNode, content: createBlockData(), stage: createBlockData(), seo: createBlockData() },
    {
        id: "0190a5f4-0000-7000-8000-000000000012",
        node: otherScopeNode,
        content: createBlockData(),
        stage: createBlockData(),
        seo: createBlockData(),
    },
    { id: "0190a5f4-0000-7000-8000-000000000013", node: null, content: createBlockData(), stage: createBlockData(), seo: createBlockData() },
    {
        id: "0190a5f4-0000-7000-8000-000000000014",
        node: homeNode,
        content: createBlockData(DeletedLinkTargetBlockTransformerService),
        stage: createBlockData(),
        seo: createBlockData(),
    },
];
const unknownId = "0190a5f4-0000-7000-8000-000000000099";

const readApi = {
    getFirstNodeByAttachedPageId: async (pageId: string) => pages.find((page) => page.id === pageId)?.node ?? null,
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
};

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp([
        BlocksTransformerService,
        RequestScopedBlockTransformerService,
        DeletedLinkTargetBlockTransformerService,
        { provide: PageTreeService, useValue: { createReadApi: () => readApi } },
        {
            provide: EntityManager,
            useValue: { findOne: async (_: unknown, id: string) => pages.find((page) => page.id === id) ?? null },
        },
        createOrmProvider(
            new Map<unknown, { id: string }[]>([
                [PageTreeNode, nodes],
                [Page, pages],
            ]),
        ),
    ]);
});

beforeEach(() => {
    transformedBlocks.length = 0;
});

afterAll(async () => {
    await mcpTestApp?.close();
});

describe("PageTools", () => {
    it("answers get_page with the blocks transformed as the admin's editor sees them", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_page", { id: pages[0].id });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({
            id: pages[0].id,
            pageTreeNode: { id: homeNode.id, path: "/home" },
            content: { transformed: true },
            stage: { transformed: true },
            seo: { transformed: true },
        });
        expect(transformedBlocks).toHaveLength(3);
        for (const { blockContext, requestContext } of transformedBlocks) {
            expect(blockContext).toEqual({ includeInvisibleContent: true, previewDamUrls: true });
            // So that internal links to unpublished and archived pages resolve to their target, as in the admin.
            expect(requestContext?.includeInvisiblePages).toEqual(
                expect.arrayContaining([PageTreeNodeVisibility.Unpublished, PageTreeNodeVisibility.Archived]),
            );
        }
    });

    it.each([
        ["of a scope the user may not read", pages[1].id],
        ["that doesn't exist", unknownId],
        ["that isn't attached to a page tree node", pages[2].id],
    ])("answers a page %s as if it didn't exist", async (_, id) => {
        const { text, isError } = await mcpTestApp.callTool("get_page", { id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page ${id}.`);
        expect(transformedBlocks).toEqual([]);
    });

    it("doesn't answer a page whose link target is missing as if the page didn't exist", async () => {
        const logError = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

        const { text, isError } = await mcpTestApp.callTool("get_page", { id: pages[3].id });

        expect(isError).toBe(true);
        expect(text).toBe("Internal server error");
        expect(logError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining(deletedNewsId) }));
        logError.mockRestore();
    });
});
