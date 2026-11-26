import { PageTreeService } from "@dextinity/cms-api";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { allowedScope, createMcpTestApp, createOrmProvider } from "./mcp.test-helper.js";

const otherScope = { domain: "secondary", language: "en" };
const homeNode = { id: "0190a5f4-0000-7000-8000-000000000001", name: "Home", slug: "home", documentType: "Page", scope: allowedScope };
const otherScopeNode = { id: "0190a5f4-0000-7000-8000-000000000002", name: "Other", slug: "other", documentType: "Page", scope: otherScope };
const nodes = [homeNode, otherScopeNode];
const homePageId = "0190a5f4-0000-7000-8000-000000000011";
const unknownId = "0190a5f4-0000-7000-8000-000000000099";
const getNodes = vi.fn(async () => [homeNode]);

const readApi = {
    preloadNodes: async () => undefined,
    getNodes,
    getNodesCount: async () => 1,
    getNode: async (id: string) => nodes.find((node) => node.id === id) ?? null,
    getNodeByPath: async (path: string, { scope }: { scope: unknown }) =>
        nodes.find((node) => `/${node.slug}` === path && node.scope === scope) ?? null,
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
    parentNodes: async () => [],
    getChildNodes: async () => [],
};

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp([
        {
            provide: PageTreeService,
            useValue: {
                createReadApi: () => readApi,
                getActiveAttachedDocument: async (nodeId: string) => (nodeId === homeNode.id ? { documentId: homePageId } : null),
            },
        },
        createOrmProvider(new Map<unknown, { id: string }[]>([[PageTreeNode, nodes]])),
    ]);
});

afterAll(async () => {
    await mcpTestApp?.close();
});

describe("PageTreeTools", () => {
    it("answers get_page_tree_node with the ID of the attached document", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_page_tree_node", { id: homeNode.id });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ id: homeNode.id, path: "/home", documentId: homePageId, scope: allowedScope });
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
