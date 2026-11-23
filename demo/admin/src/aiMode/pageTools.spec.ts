import { describe, expect, it, vi } from "vitest";

import type { EditBlocks } from "./editBlocks";
import { type AiModePageState, createPageTools } from "./pageTools";

const pageState: AiModePageState = {
    pageTreeNodeId: "1",
    documentType: "Page",
    documentId: "2",
    path: "/about-us",
    activeTab: "content",
    hasChanges: true,
};

function getPageTool(name: string, { editBlocks = vi.fn<EditBlocks>() }: { editBlocks?: EditBlocks } = {}) {
    const clearTextSelection = vi.fn();
    const tool = createPageTools({ pageState, getDocumentSummary: () => ({ content: { blocks: [] } }), editBlocks }).find(
        (candidate) => candidate.name === name,
    );
    if (!tool) {
        throw new Error(`No page tool "${name}"`);
    }
    return {
        tool,
        call: (args: Record<string, unknown>) => tool.handler(args, { clearTextSelection }),
        clearTextSelection,
    };
}

it("keeps every description within 4096 characters, the limit for a tool description", () => {
    for (const tool of createPageTools({ pageState, getDocumentSummary: () => ({}), editBlocks: vi.fn() })) {
        expect(tool.description.length, tool.name).toBeLessThanOrEqual(4096);
    }
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
