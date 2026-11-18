import { describe, expect, it, vi } from "vitest";

import type { AiModePageState } from "./AiModePageStateContext";
import type { AiModePageTools } from "./AiModePageToolsContext";
import { createAdminHostTools } from "./hostTools";

const scopeUrl = "/main/en";

function createTools({ pageState = null, pageTools = null }: { pageState?: AiModePageState | null; pageTools?: AiModePageTools | null } = {}) {
    const navigate = vi.fn();
    const clearTextSelection = vi.fn();
    const tools = createAdminHostTools({
        navigate,
        scopeUrl,
        getPageState: () => pageState,
        getPageTools: () => pageTools,
        clearTextSelection,
    });
    return { tools, navigate, clearTextSelection };
}

function getTool({ name, ...options }: { name: string } & Parameters<typeof createTools>[0]) {
    const { tools, ...rest } = createTools(options);
    const tool = tools.find((candidate) => candidate.name === name);
    if (!tool) {
        throw new Error(`No host tool "${name}"`);
    }
    return { tool, ...rest };
}

it("keeps every description within 4096 characters, the limit for a tool description", () => {
    for (const tool of createTools().tools) {
        expect(tool.description.length, tool.name).toBeLessThanOrEqual(4096);
    }
});

describe("open_page", () => {
    const nodeId = "0199b3c4-7d2e-7a10-9a4b-3f2c1d0e9f8a";

    it("opens the editor of a page tree node of the current scope, in the node's category", () => {
        const { tool, navigate } = getTool({ name: "open_page" });

        tool.handler({ id: nodeId, category: "topMenu" });

        expect(navigate).toHaveBeenCalledWith(`${scopeUrl}/pages/pagetree/top-menu/${nodeId}/edit`);
    });

    it("doesn't claim the page is open, as the user may decide to stay on a page with unsaved changes", () => {
        const { tool } = getTool({ name: "open_page" });

        expect(tool.handler({ id: nodeId, category: "topMenu" })).toContain("check with get_page_state");
    });

    it("refuses an ID that is no UUID, so it cannot reach another path", () => {
        const { tool, navigate } = getTool({ name: "open_page" });

        expect(() => tool.handler({ id: "../../dashboard", category: "mainNavigation" })).toThrow("UUID");
        expect(navigate).not.toHaveBeenCalled();
    });

    it("refuses a category the page tree does not have", () => {
        const { tool } = getTool({ name: "open_page" });

        expect(() => tool.handler({ id: nodeId, category: "footer" })).toThrow("mainNavigation, topMenu");
    });
});

describe("get_page_state", () => {
    it("says that no page is open", () => {
        const { tool } = getTool({ name: "get_page_state" });

        expect(tool.handler({})).toBe("No page is currently open in the editor.");
    });

    it("returns the metadata and the summary of the open page", () => {
        const { tool } = getTool({
            name: "get_page_state",
            pageState: {
                metadata: { pageTreeNodeId: "1", documentType: "Page", documentId: "2", path: "/about-us", activeTab: "content", hasChanges: true },
                getDocumentSummary: () => ({ content: { blocks: [] } }),
            },
        });

        expect(tool.handler({})).toEqual({
            pageTreeNodeId: "1",
            documentType: "Page",
            documentId: "2",
            path: "/about-us",
            activeTab: "content",
            hasChanges: true,
            document: { content: { blocks: [] } },
        });
    });
});

describe("edit_blocks", () => {
    it("is not read-only, so the chat asks the user to approve every call", () => {
        const { tool } = getTool({ name: "edit_blocks" });

        expect(tool.readOnlyHint).toBe(false);
    });

    it("says that no editable page is open", async () => {
        const { tool } = getTool({ name: "edit_blocks" });

        expect(await tool.handler({ operations: [{ operation: "remove", key: "a" }] })).toMatch(/^No page whose content blocks can be edited/);
    });

    it("hands the operations to the open page and counts the changes", async () => {
        const editBlocks = vi.fn<NonNullable<AiModePageTools["editBlocks"]>>().mockResolvedValue({
            results: [
                { operation: "remove", key: "a", type: "richtext", index: 0 },
                { operation: "move", key: "b", type: "heading", from: 1, index: 1 },
            ],
        });
        const { tool } = getTool({ name: "edit_blocks", pageTools: { editBlocks } });

        const result = await tool.handler({
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
        const editBlocks = vi.fn<NonNullable<AiModePageTools["editBlocks"]>>().mockResolvedValue({
            results: [{ operation: "update", key: "a", type: "richtext", index: 0 }],
        });
        const { tool, clearTextSelection } = getTool({ name: "edit_blocks", pageTools: { editBlocks } });

        await tool.handler({ operations: [{ operation: "update", key: "a", props: {} }] });

        expect(clearTextSelection).toHaveBeenCalledTimes(1);
    });

    it("keeps the selected text when nothing changed", async () => {
        const editBlocks = vi.fn<NonNullable<AiModePageTools["editBlocks"]>>().mockResolvedValue({
            results: [{ operation: "move", key: "a", type: "richtext", from: 0, index: 0 }],
        });
        const { tool, clearTextSelection } = getTool({ name: "edit_blocks", pageTools: { editBlocks } });

        await tool.handler({ operations: [{ operation: "move", key: "a", index: 0 }] });

        expect(clearTextSelection).not.toHaveBeenCalled();
    });

    it("refuses an operation that lacks what it needs, before the page is asked", async () => {
        const editBlocks = vi.fn<NonNullable<AiModePageTools["editBlocks"]>>();
        const { tool } = getTool({ name: "edit_blocks", pageTools: { editBlocks } });

        await expect(async () => tool.handler({ operations: [{ operation: "update", props: {} }] })).rejects.toThrow(
            'Operation 1 ("update") needs a "key"',
        );
        expect(editBlocks).not.toHaveBeenCalled();
    });
});
