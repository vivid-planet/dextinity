import { type PropsWithChildren, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { act, render } from "test-utils";
import { describe, expect, it, vi } from "vitest";

import type { BlockInterface } from "../blocks/types";
import { AiModeToolsetsProvider, type AiModeToolsetsStore, useAiModeToolsetsStore } from "./AiModeToolsets";
import type { BlocksBlockChild } from "./blockProps";
import { useAiModePageTreeDocumentToolset } from "./useAiModePageTreeDocumentToolset";

vi.mock("../blocks/context/useBlockContext", () => ({ useBlockContext: () => ({}) }));
vi.mock("../contentScope/Provider", () => ({ useContentScope: () => ({ scope: {} }) }));

const ContentBlock = {} as BlockInterface;
const SeoBlock = {} as BlockInterface;

const contentBlock = (key: string): BlocksBlockChild => ({ key, type: "richtext", visible: true, selected: false, slideIn: false, props: {} });

type PageState = {
    path: string;
    document: { __typename: string; id: string; content: { blocks: BlocksBlockChild[] }; seo: { htmlTitle: string } } | null;
};

let store: AiModeToolsetsStore;
let latestPageState: PageState | undefined;

function CaptureStore({ children }: PropsWithChildren) {
    store = useAiModeToolsetsStore();
    return <>{children}</>;
}

function EditPage() {
    const [pageState, setPageState] = useState<PageState | undefined>({
        path: "/about-us",
        document: { __typename: "Page", id: "document-id", content: { blocks: [contentBlock("a")] }, seo: { htmlTitle: "About us" } },
    });
    latestPageState = pageState;
    useAiModePageTreeDocumentToolset({
        pageTreeNodeId: "node-id",
        pageState,
        setPageState,
        hasChanges: false,
        rootBlocks: { content: ContentBlock, seo: SeoBlock },
        summarizeRootBlocks: { seo: (_block, state) => ({ seoState: state }) },
        editableBlocks: { rootBlockKey: "content", supportedBlocks: { richtext: {} as BlockInterface }, schemaBlockName: "PageContent" },
        defaultTab: "content",
    });
    return null;
}

function renderEditPage(path: string) {
    render(
        <AiModeToolsetsProvider>
            <CaptureStore>
                <MemoryRouter initialEntries={[path]}>
                    <Routes>
                        <Route path="/pages/:id/edit/*" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            </CaptureStore>
        </AiModeToolsetsProvider>,
    );
}

const callTool = (name: string, args: Record<string, unknown> = {}) => store.getTool(name)?.handler(args, { clearTextSelection: vi.fn() });

describe("useAiModePageTreeDocumentToolset", () => {
    it("reports the open tab and block from the URL", () => {
        renderEditPage("/pages/node-id/edit/content/a/edit");

        expect(store.getToolsets()[0].context).toEqual({
            pageTreeNodeId: "node-id",
            documentType: "Page",
            documentId: "document-id",
            path: "/about-us",
            activeTab: "content",
            selectedBlockRoute: "/a/edit",
            hasChanges: false,
        });
    });

    it("reports the default tab when the URL names none", () => {
        renderEditPage("/pages/node-id/edit");

        expect(store.getToolsets()[0].context).toMatchObject({ activeTab: "content", selectedBlockRoute: undefined });
    });

    it("summarizes every root block, with the summary given for a root block", () => {
        renderEditPage("/pages/node-id/edit");

        expect(callTool("get_page_state")).toMatchObject({
            document: { content: { blocks: [{ key: "a", type: "richtext" }] }, seo: { seoState: { htmlTitle: "About us" } } },
        });
    });

    it("edits the blocks of the editable root block in the page state", async () => {
        renderEditPage("/pages/node-id/edit");

        await act(async () => {
            await callTool("edit_blocks", { operations: [{ operation: "hide", key: "a" }] });
        });

        expect(latestPageState?.document?.content.blocks).toEqual([{ ...contentBlock("a"), visible: false }]);
        expect(latestPageState?.document?.seo).toEqual({ htmlTitle: "About us" });
    });
});
