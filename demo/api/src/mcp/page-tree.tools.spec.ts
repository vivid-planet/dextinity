import { PageTreeNodeVisibility } from "@dextinity/cms-api";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { allowedScope, createBlockData, createMcpTestApp, transformedBlocks } from "./mcp.test-helper.js";

const otherScope = { domain: "secondary", language: "en" };
const homeNode = { id: "0190a5f4-0000-7000-8000-000000000001", name: "Home", slug: "home", documentType: "Page", scope: allowedScope };
const otherScopeNode = { id: "0190a5f4-0000-7000-8000-000000000002", name: "Other", slug: "other", documentType: "Page", scope: otherScope };
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

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp({ pageTreeNodes: [homeNode, otherScopeNode], pages, getPageTreeNodes: getNodes });
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
