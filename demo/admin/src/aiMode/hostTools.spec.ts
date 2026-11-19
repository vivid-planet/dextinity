import { describe, expect, it, vi } from "vitest";

import type { AiModeTool } from "./AiModeScopes";
import type { EditBlocks } from "./editBlocks";
import { type AiModePageState, createAdminTools, createPageTools, createPageTreeTools } from "./hostTools";

const scopeUrl = "/main/en";

const pageState: AiModePageState = {
    pageTreeNodeId: "1",
    documentType: "Page",
    documentId: "2",
    path: "/about-us",
    activeTab: "content",
    hasChanges: true,
};

function findTool(tools: AiModeTool[], name: string) {
    const tool = tools.find((candidate) => candidate.name === name);
    if (!tool) {
        throw new Error(`No host tool "${name}"`);
    }
    return tool;
}

function getPageTreeTool(name: string) {
    const navigate = vi.fn();
    const tool = findTool(createPageTreeTools({ navigate, scopeUrl }), name);
    return { call: (args: Record<string, unknown>) => tool.handler(args, { clearTextSelection: vi.fn() }), navigate };
}

function getPageTool(name: string, { editBlocks = vi.fn<EditBlocks>() }: { editBlocks?: EditBlocks } = {}) {
    const clearTextSelection = vi.fn();
    const tool = findTool(createPageTools({ pageState, getDocumentSummary: () => ({ content: { blocks: [] } }), editBlocks }), name);
    return {
        tool,
        call: (args: Record<string, unknown>) => tool.handler(args, { clearTextSelection }),
        clearTextSelection,
    };
}

it("keeps every description within 4096 characters, the limit for a tool description", () => {
    const tools = [
        ...createAdminTools({ pages: [], navigate: vi.fn(), scopeUrl }),
        ...createPageTreeTools({ navigate: vi.fn(), scopeUrl }),
        ...createPageTools({ pageState, getDocumentSummary: () => ({}), editBlocks: vi.fn() }),
    ];

    for (const tool of tools) {
        expect(tool.description.length, tool.name).toBeLessThanOrEqual(4096);
    }
});

describe("open_admin_page", () => {
    const pages = [
        { path: "/assets", label: "Assets" },
        { path: "/system/redirects", label: "System › Redirects" },
    ];

    function getOpenAdminPage() {
        const navigate = vi.fn();
        const tool = findTool(createAdminTools({ pages, navigate, scopeUrl }), "open_admin_page");
        return { tool, navigate, call: (args: Record<string, unknown>) => tool.handler(args, { clearTextSelection: vi.fn() }) };
    }

    it("lists the pages with their labels in the description of the path", () => {
        const { tool } = getOpenAdminPage();

        expect(JSON.stringify(tool.inputSchema)).toContain("/system/redirects: System › Redirects");
    });

    it("opens a page in the current content scope", () => {
        const { call, navigate } = getOpenAdminPage();

        expect(call({ path: "/system/redirects" })).toContain('Asked the admin to open "System › Redirects"');
        expect(navigate).toHaveBeenCalledWith(`${scopeUrl}/system/redirects`);
    });

    it("refuses a path that isn't a page of the list, so it cannot reach any other route", () => {
        const { call, navigate } = getOpenAdminPage();

        expect(() => call({ path: "/user-permissions" })).toThrow("It must be one of: /assets, /system/redirects.");
        expect(navigate).not.toHaveBeenCalled();
    });
});

describe("open_page", () => {
    const nodeId = "0199b3c4-7d2e-7a10-9a4b-3f2c1d0e9f8a";

    it("opens the editor of a page tree node of the current scope, in the node's category", () => {
        const { call, navigate } = getPageTreeTool("open_page");

        call({ id: nodeId, category: "topMenu" });

        expect(navigate).toHaveBeenCalledWith(`${scopeUrl}/pages/pagetree/top-menu/${nodeId}/edit`);
    });

    it("runs without the user's approval, because it only navigates", () => {
        expect(findTool(createPageTreeTools({ navigate: vi.fn(), scopeUrl }), "open_page").readOnlyHint).toBe(true);
    });

    it("doesn't claim the page is open, as the user may decide to stay on a page with unsaved changes", () => {
        const { call } = getPageTreeTool("open_page");

        expect(call({ id: nodeId, category: "topMenu" })).toContain("check with get_page_state");
    });

    it("refuses an ID that is no UUID, so it cannot reach another path", () => {
        const { call, navigate } = getPageTreeTool("open_page");

        expect(() => call({ id: "../../dashboard", category: "mainNavigation" })).toThrow("UUID");
        expect(navigate).not.toHaveBeenCalled();
    });

    it("refuses a category the page tree does not have", () => {
        const { call } = getPageTreeTool("open_page");

        expect(() => call({ id: nodeId, category: "footer" })).toThrow("mainNavigation, topMenu");
    });
});

describe("get_page_state", () => {
    it("returns the metadata and the summary of the open page", () => {
        const { call } = getPageTool("get_page_state");

        expect(call({})).toEqual({ ...pageState, document: { content: { blocks: [] } } });
    });
});

describe("edit_blocks", () => {
    it("is not read-only, so the chat asks the user to approve every call", () => {
        const { tool } = getPageTool("edit_blocks");

        expect(tool.readOnlyHint).toBe(false);
    });

    it("hands the operations to the open page and counts the changes", async () => {
        const editBlocks = vi.fn<EditBlocks>().mockResolvedValue({
            results: [
                { operation: "remove", key: "a", type: "richtext", index: 0 },
                { operation: "move", key: "b", type: "heading", from: 1, index: 1 },
            ],
        });
        const { call } = getPageTool("edit_blocks", { editBlocks });

        const result = await call({
            operations: [
                { operation: "remove", key: "a" },
                { operation: "move", key: "b", index: 1 },
            ],
        });

        expect(editBlocks).toHaveBeenCalledWith({
            operations: [
                { operation: "remove", key: "a" },
                { operation: "move", key: "b", index: 1 },
            ],
        });
        expect(result).toMatchObject({ message: expect.stringMatching(/^Applied 1 change to the page's content/) });
    });

    it("forgets the selected text once the change is applied, because the agent replaced it", async () => {
        const editBlocks = vi.fn<EditBlocks>().mockResolvedValue({
            results: [{ operation: "update", key: "a", type: "richtext", index: 0 }],
        });
        const { call, clearTextSelection } = getPageTool("edit_blocks", { editBlocks });

        await call({ operations: [{ operation: "update", key: "a", props: {} }] });

        expect(clearTextSelection).toHaveBeenCalledTimes(1);
    });

    it("keeps the selected text when nothing changed", async () => {
        const editBlocks = vi.fn<EditBlocks>().mockResolvedValue({
            results: [{ operation: "move", key: "a", type: "richtext", from: 0, index: 0 }],
        });
        const { call, clearTextSelection } = getPageTool("edit_blocks", { editBlocks });

        await call({ operations: [{ operation: "move", key: "a", index: 0 }] });

        expect(clearTextSelection).not.toHaveBeenCalled();
    });

    it("refuses an operation that lacks what it needs, before the page is asked", async () => {
        const editBlocks = vi.fn<EditBlocks>();
        const { call } = getPageTool("edit_blocks", { editBlocks });

        await expect(async () => call({ operations: [{ operation: "update", props: {} }] })).rejects.toThrow('Operation 1 ("update") needs a "key"');
        expect(editBlocks).not.toHaveBeenCalled();
    });
});
