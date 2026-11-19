import type { AiModeTool, BlockContext, BlockInterface, EditableBlocksBlock } from "@dextinity/cms-admin";
import { describe, expect, it, vi } from "vitest";

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

type ContentBlocks = Omit<EditableBlocksBlock, "schemaBlockName">;
type ContentBlock = ReturnType<ContentBlocks["getBlocks"]>[number];

const contentBlock = (key: string, type = "richtext"): ContentBlock => ({ key, type, visible: true, selected: false, slideIn: false, props: {} });

function createContentBlocks(blocks: ContentBlock[] = []) {
    let current = blocks;
    const contentBlocks: ContentBlocks = {
        supportedBlocks: { richtext: {} as BlockInterface, heading: {} as BlockInterface },
        blockContext: {} as BlockContext,
        getBlocks: () => current,
        updateBlocks: vi.fn((update) => {
            current = update([...current]);
        }),
    };
    return { contentBlocks, getKeys: () => current.map(({ key }) => key) };
}

function getPageTool(name: string, { contentBlocks = createContentBlocks().contentBlocks }: { contentBlocks?: ContentBlocks } = {}) {
    const clearTextSelection = vi.fn();
    const tool = findTool(createPageTools({ pageState, getDocumentSummary: () => ({ content: { blocks: [] } }), contentBlocks }), name);
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
        ...createPageTools({ pageState, getDocumentSummary: () => ({}), contentBlocks: createContentBlocks().contentBlocks }),
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

    it("runs without the user's approval, because it only navigates", () => {
        expect(getOpenAdminPage().tool.readOnlyHint).toBe(true);
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

describe("open_page_tree_node", () => {
    const nodeId = "0199b3c4-7d2e-7a10-9a4b-3f2c1d0e9f8a";

    it("opens the editor of a page tree node of the current scope, in the node's category", () => {
        const { call, navigate } = getPageTreeTool("open_page_tree_node");

        call({ id: nodeId, category: "topMenu" });

        expect(navigate).toHaveBeenCalledWith(`${scopeUrl}/pages/pagetree/top-menu/${nodeId}/edit`);
    });

    it("runs without the user's approval, because it only navigates", () => {
        expect(findTool(createPageTreeTools({ navigate: vi.fn(), scopeUrl }), "open_page_tree_node").readOnlyHint).toBe(true);
    });

    it("doesn't claim the page is open, as the user may decide to stay on a page with unsaved changes", () => {
        const { call } = getPageTreeTool("open_page_tree_node");

        expect(call({ id: nodeId, category: "topMenu" })).toContain("check with get_page_state");
    });

    it("refuses an ID that is no UUID, so it cannot reach another path", () => {
        const { call, navigate } = getPageTreeTool("open_page_tree_node");

        expect(() => call({ id: "../../dashboard", category: "mainNavigation" })).toThrow("UUID");
        expect(navigate).not.toHaveBeenCalled();
    });

    it("refuses a category the page tree does not have", () => {
        const { call } = getPageTreeTool("open_page_tree_node");

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

    it("tells the agent where the schema lookup starts and what it can't edit", () => {
        const { tool } = getPageTool("edit_blocks");

        expect(tool.description).toContain("The page's content is the 'PageContent' block.");
        expect(tool.description).toContain("'media' is the 'StandaloneMedia' block");
        expect(tool.description).toContain("not the stage or the SEO settings");
    });

    it("applies the operations to the page's content in one update and counts the changes", async () => {
        const { contentBlocks, getKeys } = createContentBlocks([contentBlock("a"), contentBlock("b", "heading")]);
        const { call } = getPageTool("edit_blocks", { contentBlocks });

        const result = await call({
            operations: [
                { operation: "remove", key: "a" },
                { operation: "move", key: "b", index: 0 },
            ],
        });

        expect(getKeys()).toEqual(["b"]);
        expect(contentBlocks.updateBlocks).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ message: expect.stringMatching(/^Applied 1 change to the page's content/) });
    });

    it("forgets the selected text once the change is applied, because the agent replaced it", async () => {
        const { contentBlocks } = createContentBlocks([contentBlock("a")]);
        const { call, clearTextSelection } = getPageTool("edit_blocks", { contentBlocks });

        await call({ operations: [{ operation: "hide", key: "a" }] });

        expect(clearTextSelection).toHaveBeenCalledTimes(1);
    });

    it("keeps the selected text when nothing changed", async () => {
        const { contentBlocks } = createContentBlocks([contentBlock("a")]);
        const { call, clearTextSelection } = getPageTool("edit_blocks", { contentBlocks });

        await call({ operations: [{ operation: "move", key: "a", index: 0 }] });

        expect(contentBlocks.updateBlocks).not.toHaveBeenCalled();
        expect(clearTextSelection).not.toHaveBeenCalled();
    });

    it("refuses an operation that lacks what it needs, before the content is changed", async () => {
        const { contentBlocks } = createContentBlocks([contentBlock("a")]);
        const { call } = getPageTool("edit_blocks", { contentBlocks });

        await expect(async () => call({ operations: [{ operation: "update", props: {} }] })).rejects.toThrow(
            'Operation 1 ("update") needs a "key", the key of the block to act on, as get_page_state reports it.',
        );
        expect(contentBlocks.updateBlocks).not.toHaveBeenCalled();
    });
});
