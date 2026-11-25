import { describe, expect, it, vi } from "vitest";

import { createPageTreeNavigationTools } from "./pageTreeTools";

const scopeUrl = "/main/en";

const createTools = (navigate: (path: string) => void) =>
    createPageTreeNavigationTools({
        categories: ["mainNavigation", "topMenu"],
        getEditPath: ({ id, category }) => `${scopeUrl}/pages/pagetree/${category === "topMenu" ? "top-menu" : "main-navigation"}/${id}/edit`,
        navigate,
    });

function getPageTreeNavigationTool(name: string) {
    const navigate = vi.fn();
    const tool = createTools(navigate).find((candidate) => candidate.name === name);
    if (!tool) {
        throw new Error(`No page tree navigation tool "${name}"`);
    }
    return { tool, call: (args: Record<string, unknown>) => tool.handler(args, { clearTextSelection: vi.fn() }), navigate };
}

it("keeps every description within 4096 characters, the limit for a tool description", () => {
    for (const tool of createTools(vi.fn())) {
        expect(tool.description.length, tool.name).toBeLessThanOrEqual(4096);
    }
});

describe("open_page_tree_node", () => {
    const nodeId = "0199b3c4-7d2e-7a10-9a4b-3f2c1d0e9f8a";

    it("opens the editor of a page tree node of the current scope, in the node's category", () => {
        const { call, navigate } = getPageTreeNavigationTool("open_page_tree_node");

        call({ id: nodeId, category: "topMenu" });

        expect(navigate).toHaveBeenCalledWith(`${scopeUrl}/pages/pagetree/top-menu/${nodeId}/edit`);
    });

    it("runs without the user's approval, because it only navigates", () => {
        expect(getPageTreeNavigationTool("open_page_tree_node").tool.readOnlyHint).toBe(true);
    });

    it("doesn't claim the page is open, as the user may decide to stay on a page with unsaved changes", () => {
        const { call } = getPageTreeNavigationTool("open_page_tree_node");

        expect(call({ id: nodeId, category: "topMenu" })).toContain("check with get_page_state");
    });

    it("refuses an ID that is no UUID, so it cannot reach another path", () => {
        const { call, navigate } = getPageTreeNavigationTool("open_page_tree_node");

        expect(() => call({ id: "../../dashboard", category: "mainNavigation" })).toThrow("UUID");
        expect(navigate).not.toHaveBeenCalled();
    });

    it("refuses a category the page tree does not have", () => {
        const { call } = getPageTreeNavigationTool("open_page_tree_node");

        expect(() => call({ id: nodeId, category: "footer" })).toThrow("mainNavigation, topMenu");
    });
});
