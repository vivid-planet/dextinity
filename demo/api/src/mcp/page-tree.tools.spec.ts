import {
    BlocksTransformerService,
    getRequestContextHeadersFromRequest,
    PageTreeNodeVisibility,
    PageTreeService,
    type RequestContextInterface,
} from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable, Scope } from "@nestjs/common";
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

function createBlockData() {
    return { transformToPlain: () => RequestScopedBlockTransformerService, transformToSave: () => ({}) };
}

const otherScope = { domain: "secondary", language: "en" };
const homeNode = { id: "0190a5f4-0000-7000-8000-000000000001", name: "Home", slug: "home", documentType: "Page", scope: allowedScope };
const otherScopeNode = { id: "0190a5f4-0000-7000-8000-000000000002", name: "Other", slug: "other", documentType: "Page", scope: otherScope };
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
];
const unknownId = "0190a5f4-0000-7000-8000-000000000099";
const getNodes = vi.fn(async () => [homeNode]);

const readApi = {
    preloadNodes: async () => undefined,
    getNodes,
    getNodesCount: async () => 1,
    getNode: async (id: string) => nodes.find((node) => node.id === id) ?? null,
    getNodeByPath: async (path: string, { scope }: { scope: unknown }) =>
        nodes.find((node) => `/${node.slug}` === path && node.scope === scope) ?? null,
    getFirstNodeByAttachedPageId: async (pageId: string) => pages.find((page) => page.id === pageId)?.node ?? null,
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
    parentNodes: async () => [],
    getChildNodes: async () => [],
};

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp([
        BlocksTransformerService,
        RequestScopedBlockTransformerService,
        {
            provide: PageTreeService,
            useValue: {
                createReadApi: () => readApi,
                getActiveAttachedDocument: async (nodeId: string) => {
                    const page = pages.find((candidate) => candidate.node.id === nodeId);
                    return page ? { documentId: page.id } : null;
                },
            },
        },
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

describe("PageTreeTools", () => {
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
    ])("answers a page %s as if it didn't exist", async (_, id) => {
        const { text, isError } = await mcpTestApp.callTool("get_page", { id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page ${id}.`);
        expect(transformedBlocks).toEqual([]);
    });

    it("answers get_page_tree_node with the ID of the attached document", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_page_tree_node", { id: homeNode.id });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ id: homeNode.id, path: "/home", documentId: pages[0].id, scope: allowedScope });
    });

    it.each([
        ["of a scope the user may not read", otherScopeNode.id],
        ["that doesn't exist", unknownId],
    ])("answers a page tree node %s as if it didn't exist", async (_, id) => {
        const { text, isError } = await mcpTestApp.callTool("get_page_tree_node", { id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page tree node ${id}.`);
    });

    it("lists the page tree nodes of a scope the user may read", async () => {
        const { text, isError } = await mcpTestApp.callTool("list_page_tree_nodes", { scope: allowedScope, category: "mainNavigation" });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ nodes: [{ id: homeNode.id, path: "/home" }], totalCount: 1 });
        expect(getNodes).toHaveBeenCalledWith(expect.objectContaining({ scope: allowedScope, category: "mainNavigation", limit: 100, offset: 0 }));
    });

    it.each([
        ["list_page_tree_nodes", { scope: otherScope }],
        ["get_page_tree_node_by_path", { scope: otherScope, path: "/other" }],
    ])("refuses %s in a scope the user may not read", async (tool, args) => {
        const { text, isError } = await mcpTestApp.callTool(tool, args);

        expect(isError).toBe(true);
        expect(text).toBe("You may not read the page tree of this scope.");
    });

    it("refuses a system user, whom the permission check lets through", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_page_tree_node", { id: homeNode.id }, "system");

        expect(isError).toBe(true);
        expect(text).toBe("The MCP server answers only a user signed in to the admin.");
    });
});
