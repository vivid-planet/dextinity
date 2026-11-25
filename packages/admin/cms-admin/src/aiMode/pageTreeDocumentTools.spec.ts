import { describe, expect, it, vi } from "vitest";

import type { BlockContext } from "../blocks/context/BlockContext";
import type { BlockInterface } from "../blocks/types";
import { type AiModePageTreeDocumentEditableBlocks, type AiModePageTreeDocumentState, createPageTreeDocumentTools } from "./pageTreeDocumentTools";

const state: AiModePageTreeDocumentState = {
    pageTreeNodeId: "1",
    documentType: "Page",
    documentId: "2",
    path: "/about-us",
    activeTab: "content",
    hasChanges: true,
};

type ContentBlocks = AiModePageTreeDocumentEditableBlocks;
type ContentBlock = ReturnType<ContentBlocks["getBlocks"]>[number];

const contentBlock = (key: string, type = "richtext"): ContentBlock => ({ key, type, visible: true, selected: false, slideIn: false, props: {} });

function createContentBlocks(blocks: ContentBlock[] = []) {
    let current = blocks;
    const contentBlocks: ContentBlocks = {
        rootBlockKey: "content",
        schemaBlockName: "PageContent",
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
    const tool = createPageTreeDocumentTools({ state, getDocumentSummary: () => ({ content: { blocks: [] } }), editableBlocks: contentBlocks }).find(
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
    for (const tool of createPageTreeDocumentTools({ state, getDocumentSummary: () => ({}), editableBlocks: createContentBlocks().contentBlocks })) {
        expect(tool.description.length, tool.name).toBeLessThanOrEqual(4096);
    }
});

describe("get_page_state", () => {
    it("returns the metadata and the summary of the open page", () => {
        const { call } = getPageTool("get_page_state");

        expect(call({})).toEqual({ ...state, document: { content: { blocks: [] } } });
    });
});

it("offers no block editing for a document whose blocks the agent only reads", () => {
    const tools = createPageTreeDocumentTools({ state, getDocumentSummary: () => ({}) });

    expect(tools.map(({ name }) => name)).toEqual(["get_page_state"]);
    expect(tools[0].description).not.toContain("edit_blocks");
});

describe("edit_blocks", () => {
    it("is not read-only, so the chat asks the user to approve every call", () => {
        const { tool } = getPageTool("edit_blocks");

        expect(tool.readOnlyHint).toBe(false);
    });

    it("tells the agent where the schema lookup starts and what it can't edit", () => {
        const { tool } = getPageTool("edit_blocks");

        expect(tool.description).toContain("The page's content is the 'PageContent' block.");
        expect(tool.description).toContain("Only the top-level blocks of the 'content' root block can be edited");
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
