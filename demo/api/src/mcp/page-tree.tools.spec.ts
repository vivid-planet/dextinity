import { BuildsService, PAGE_TREE_CONFIG, PageTreeService, PageTreeSlugAvailability } from "@dextinity/cms-api";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { allowedScope, createMcpTestApp, createOrmProvider } from "./mcp.test-helper.js";

const otherScope = { domain: "secondary", language: "en" };
const homeNode = {
    id: "0190a5f4-0000-7000-8000-000000000001",
    name: "Home",
    slug: "home",
    visibility: "Published",
    documentType: "Page",
    scope: allowedScope,
};
const otherScopeNode = {
    id: "0190a5f4-0000-7000-8000-000000000002",
    name: "Other",
    slug: "other",
    visibility: "Published",
    documentType: "Page",
    scope: otherScope,
};
const aboutNode = {
    id: "0190a5f4-0000-7000-8000-000000000003",
    name: "About",
    slug: "about",
    visibility: "Published",
    documentType: "Page",
    category: "topMenu",
    scope: allowedScope,
};
const archivedNode = { id: "0190a5f4-0000-7000-8000-000000000004", slug: "old", visibility: "Archived", documentType: "Page", scope: allowedScope };
const newNode = { id: "0190a5f4-0000-7000-8000-000000000005", slug: "new", visibility: "Unpublished", documentType: "Page", scope: allowedScope };
const nodes = [homeNode, otherScopeNode, aboutNode, archivedNode, newNode];
const homePageId = "0190a5f4-0000-7000-8000-000000000011";
const unknownId = "0190a5f4-0000-7000-8000-000000000099";
const getNodes = vi.fn(async () => [homeNode]);

const readApi = {
    preloadNodes: async () => undefined,
    getNodes,
    getNodesCount: async () => 1,
    getNode: async (id: string) => nodes.find((node) => node.id === id) ?? null,
    getNodeOrFail: async (id: string) => nodes.find((node) => node.id === id),
    getNodeByPath: async (path: string, { scope }: { scope: unknown }) =>
        nodes.find((node) => `/${node.slug}` === path && node.scope === scope) ?? null,
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
    parentNodes: async () => [],
    getChildNodes: async () => [],
};

const pageTreeService = {
    createReadApi: () => readApi,
    getActiveAttachedDocument: async (nodeId: string) => (nodeId === homeNode.id ? { documentId: homePageId } : null),
    getSlugAvailability: vi.fn(async () => PageTreeSlugAvailability.Available),
    createNode: vi.fn(async () => newNode),
    updateNode: vi.fn(async () => undefined),
    updateNodeVisibility: vi.fn(async () => undefined),
    updateNodePosition: vi.fn(async () => undefined),
    delete: vi.fn(async () => true),
};

const buildsService = { setChangesSinceLastBuild: vi.fn(async () => undefined) };

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp([
        { provide: PageTreeService, useValue: pageTreeService },
        { provide: BuildsService, useValue: buildsService },
        { provide: PAGE_TREE_CONFIG, useValue: { reservedPaths: [], allowPageDelete: true } },
        createOrmProvider(new Map<unknown, { id: string }[]>([[PageTreeNode, nodes]])),
    ]);
});

beforeEach(() => {
    vi.clearAllMocks();
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

describe("PageTreeTools that change the page tree", () => {
    it("asks the user to approve every call of a tool that changes the page tree", async () => {
        const tools = await mcpTestApp.listTools();
        const annotations = Object.fromEntries(tools.map(({ name, annotations }) => [name, annotations ?? {}]));

        expect(annotations.check_slug_availability.readOnlyHint).toBe(true);
        for (const tool of ["create_page_tree_node", "update_page_tree_node", "update_page_tree_node_visibility", "delete_page_tree_node"]) {
            expect(annotations[tool].readOnlyHint).toBe(false);
        }
        expect(annotations.delete_page_tree_node.destructiveHint).toBe(true);
    });

    it("answers check_slug_availability as the page tree service decides it", async () => {
        pageTreeService.getSlugAvailability.mockResolvedValueOnce(PageTreeSlugAvailability.Taken);
        const { text, isError } = await mcpTestApp.callTool("check_slug_availability", { scope: allowedScope, parentId: aboutNode.id, slug: "team" });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toEqual({ availability: "Taken" });
        expect(pageTreeService.getSlugAvailability).toHaveBeenCalledWith({ scope: allowedScope, parentId: aboutNode.id, slug: "team" });
    });

    it.each(["check_slug_availability", "create_page_tree_node"])("refuses %s in a scope the user may not change", async (tool) => {
        const { text, isError } = await mcpTestApp.callTool(tool, { scope: otherScope, name: "Team", slug: "team" });

        expect(isError).toBe(true);
        expect(text).toBe("You may not change the page tree of this scope.");
        expect(pageTreeService.createNode).not.toHaveBeenCalled();
    });

    it("refuses to create a node under a parent of another scope", async () => {
        const { text, isError } = await mcpTestApp.callTool("create_page_tree_node", {
            scope: allowedScope,
            parentId: otherScopeNode.id,
            name: "Team",
            slug: "team",
        });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page tree node ${otherScopeNode.id} in this scope.`);
    });

    it("refuses to create a node under an archived parent", async () => {
        const { text, isError } = await mcpTestApp.callTool("create_page_tree_node", {
            scope: allowedScope,
            parentId: archivedNode.id,
            name: "Team",
            slug: "team",
        });

        expect(isError).toBe(true);
        expect(text).toBe("An archived page tree node can't get child nodes.");
    });

    it("refuses an invalid slug with the reason the input validation gives", async () => {
        const { text, isError } = await mcpTestApp.callTool("create_page_tree_node", { scope: allowedScope, name: "Team", slug: "Our Team" });

        expect(isError).toBe(true);
        expect(text).toContain('"path": "slug"');
        expect(pageTreeService.createNode).not.toHaveBeenCalled();
    });

    it("refuses to create a node with a slug that isn't available", async () => {
        pageTreeService.getSlugAvailability.mockResolvedValueOnce(PageTreeSlugAvailability.Reserved);
        const { text, isError } = await mcpTestApp.callTool("create_page_tree_node", { scope: allowedScope, name: "Events", slug: "events" });

        expect(isError).toBe(true);
        expect(text).toContain('The slug "events" is reserved.');
        expect(pageTreeService.createNode).not.toHaveBeenCalled();
    });

    it("creates a node with the document type it is asked for", async () => {
        const { text, isError } = await mcpTestApp.callTool("create_page_tree_node", { scope: allowedScope, name: "New", slug: "new" });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ id: newNode.id, path: "/new" });
        expect(pageTreeService.createNode).toHaveBeenCalledWith(
            expect.objectContaining({ name: "New", slug: "new", userGroup: "all", attachedDocument: expect.objectContaining({ type: "Page" }) }),
            "mainNavigation",
            allowedScope,
        );
        expect(buildsService.setChangesSinceLastBuild).toHaveBeenCalledWith(allowedScope);
    });

    it("adds a child node to the page tree of its parent", async () => {
        const { isError } = await mcpTestApp.callTool("create_page_tree_node", {
            scope: allowedScope,
            parentId: aboutNode.id,
            name: "Team",
            slug: "team",
        });

        expect(isError).toBe(false);
        expect(pageTreeService.createNode).toHaveBeenCalledWith(expect.objectContaining({ parentId: aboutNode.id }), "topMenu", allowedScope);
    });

    it.each(["update_page_tree_node", "update_page_tree_node_visibility", "delete_page_tree_node"])(
        "answers %s for a node of a scope the user may not change as if it didn't exist",
        async (tool) => {
            const { text, isError } = await mcpTestApp.callTool(tool, { id: otherScopeNode.id, visibility: "Unpublished" });

            expect(isError).toBe(true);
            expect(text).toBe(`There is no page tree node ${otherScopeNode.id}.`);
        },
    );

    it("refuses to update an archived node", async () => {
        const { text, isError } = await mcpTestApp.callTool("update_page_tree_node", { id: archivedNode.id, name: "Older" });

        expect(isError).toBe(true);
        expect(text).toContain("is archived and can't be changed");
        expect(pageTreeService.updateNode).not.toHaveBeenCalled();
    });

    it("refuses to change the slug of a node to one that is taken", async () => {
        pageTreeService.getSlugAvailability.mockResolvedValueOnce(PageTreeSlugAvailability.Taken);

        const { text, isError } = await mcpTestApp.callTool("update_page_tree_node", { id: aboutNode.id, slug: "team" });

        expect(isError).toBe(true);
        expect(text).toContain('The slug "team" is taken.');
        expect(pageTreeService.updateNode).not.toHaveBeenCalled();
    });

    it('refuses to change the slug of the node "home"', async () => {
        const { text, isError } = await mcpTestApp.callTool("update_page_tree_node", { id: homeNode.id, slug: "other" });

        expect(isError).toBe(true);
        expect(text).toBe('The slug of the page tree node "home" can\'t be changed.');
        expect(pageTreeService.updateNode).not.toHaveBeenCalled();
    });

    it("keeps the fields of a node that an update leaves out", async () => {
        const { isError } = await mcpTestApp.callTool("update_page_tree_node", { id: aboutNode.id, name: "About us" });

        expect(isError).toBe(false);
        expect(pageTreeService.updateNode).toHaveBeenCalledWith(
            aboutNode.id,
            expect.objectContaining({ name: "About us", slug: "about", createAutomaticRedirectsOnSlugChange: true }),
        );
    });

    it("restores an archived node", async () => {
        const { isError } = await mcpTestApp.callTool("update_page_tree_node_visibility", { id: archivedNode.id, visibility: "Unpublished" });

        expect(isError).toBe(false);
        expect(pageTreeService.updateNodeVisibility).toHaveBeenCalledWith(archivedNode.id, "Unpublished");
    });

    it("refuses to delete the node home", async () => {
        const { text, isError } = await mcpTestApp.callTool("delete_page_tree_node", { id: homeNode.id });

        expect(isError).toBe(true);
        expect(text).toBe('The page tree node "home" can\'t be deleted.');
        expect(pageTreeService.delete).not.toHaveBeenCalled();
    });
});
