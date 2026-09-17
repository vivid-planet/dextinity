import type { ApolloClient } from "@apollo/client";
import { readClipboardText, writeClipboardText } from "@dextinity/admin";
import type { DocumentNode, OperationDefinitionNode } from "graphql";
import { act, renderHook } from "test-utils";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { useDamScope } from "../../dam/config/useDamScope";
import { useBlockContext } from "../context/useBlockContext";
import { PixelImageBlock } from "../PixelImageBlock";
import { useBlockClipboard } from "./useBlockClipboard";

vi.mock(import("@dextinity/admin"), async (importOriginal) => ({
    ...(await importOriginal()),
    readClipboardText: vi.fn(),
    writeClipboardText: vi.fn(),
}));

vi.mock("../../dam/config/useDamScope", () => ({ useDamScope: vi.fn() }));
vi.mock("../context/useBlockContext", () => ({ useBlockContext: vi.fn() }));

const operationName = (document: DocumentNode) => (document.definitions[0] as OperationDefinitionNode).name?.value;

const damFile = (id: string) => ({ id, name: `${id}.png`, image: { width: 100, height: 100, cropArea: { focalPoint: "SMART" } } });

const query = vi.fn(async ({ query: document, variables }: { query: DocumentNode; variables: { id: string } }) => {
    switch (operationName(document)) {
        case "FindCopiesOfFileInScope":
            return { data: { findCopiesOfFileInScope: [] } };
        case "ImageBlockDamFile":
            return { data: { damFile: damFile(variables.id) } };
        default:
            throw new Error(`Unexpected query "${operationName(document)}"`);
    }
});

const mutate = vi.fn(async ({ mutation, variables }: { mutation: DocumentNode; variables: { fileIds?: string[] } }) => {
    switch (operationName(mutation)) {
        case "CreateInboxFolder":
            return { data: { createDamFolder: { id: "inbox-folder-id" } } };
        case "CopyFilesToScope":
            return {
                data: {
                    copyFilesToScope: {
                        mappedFiles: (variables.fileIds ?? []).map((fileId) => ({ rootFile: { id: fileId }, copy: { id: `${fileId}-copy` } })),
                    },
                },
            };
        default:
            throw new Error(`Unexpected mutation "${operationName(mutation)}"`);
    }
});

const clipboardContentForScope = (scope: Record<string, unknown>) =>
    JSON.stringify({
        blocks: [
            {
                name: "Image",
                visible: true,
                output: { damFileId: "file-1" },
                damFiles: [{ id: "file-1", scope }],
            },
        ],
        damScope: scope,
    });

function renderUseBlockClipboard({ damScope }: { damScope: Record<string, unknown> }) {
    (useDamScope as Mock).mockReturnValue(damScope);
    (useBlockContext as Mock).mockReturnValue({
        apolloClient: { query, mutate } as unknown as ApolloClient<unknown>,
        apiUrl: "https://example.com",
        damBasePath: "dam",
        pageTreeScope: {},
    });

    return renderHook(() => useBlockClipboard({ supports: PixelImageBlock })).result;
}

async function getClipboardContent(result: ReturnType<typeof renderUseBlockClipboard>) {
    let response!: Awaited<ReturnType<typeof result.current.getClipboardContent>>;

    await act(async () => {
        response = await result.current.getClipboardContent();
    });

    return response;
}

describe("useBlockClipboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("writes the referenced DAM files and the DAM scope to the clipboard", async () => {
        const result = renderUseBlockClipboard({ damScope: { domain: "main" } });

        await act(async () => {
            await result.current.updateClipboardContent([{ name: "Image", visible: true, state: { damFile: damFile("file-1") } }]);
        });

        expect(JSON.parse((writeClipboardText as Mock).mock.calls[0][0])).toEqual({
            damScope: { domain: "main" },
            blocks: [
                {
                    name: "Image",
                    visible: true,
                    output: { damFileId: "file-1" },
                    damFiles: [{ id: "file-1", imageCropArea: { focalPoint: "SMART" } }],
                },
            ],
        });
    });

    it("copies the referenced DAM files when pasting into another scope", async () => {
        (readClipboardText as Mock).mockResolvedValue(clipboardContentForScope({ domain: "main" }));
        const result = renderUseBlockClipboard({ damScope: { domain: "secondary" } });

        const response = await getClipboardContent(result);

        expect(response.canPaste).toBe(true);
        expect(response.canPaste && response.content[0].state.damFile?.id).toBe("file-1-copy");
        expect(mutate.mock.calls.map(([{ mutation }]) => operationName(mutation))).toEqual(["CreateInboxFolder", "CopyFilesToScope"]);
    });

    it("doesn't copy the referenced DAM files when pasting into the same scope", async () => {
        (readClipboardText as Mock).mockResolvedValue(clipboardContentForScope({ domain: "main" }));
        const result = renderUseBlockClipboard({ damScope: { domain: "main" } });

        const response = await getClipboardContent(result);

        expect(response.canPaste).toBe(true);
        expect(response.canPaste && response.content[0].state.damFile?.id).toBe("file-1");
        expect(mutate).not.toHaveBeenCalled();
    });

    it("supports content copied by an earlier version", async () => {
        (readClipboardText as Mock).mockResolvedValue(JSON.stringify([{ name: "Image", visible: true, output: { damFileId: "file-1" } }]));
        const result = renderUseBlockClipboard({ damScope: { domain: "secondary" } });

        const response = await getClipboardContent(result);

        expect(response.canPaste).toBe(true);
        expect(response.canPaste && response.content[0].state.damFile?.id).toBe("file-1");
        expect(mutate).not.toHaveBeenCalled();
    });

    it("can't paste content that isn't blocks", async () => {
        (readClipboardText as Mock).mockResolvedValue(JSON.stringify({ some: "object" }));
        const result = renderUseBlockClipboard({ damScope: { domain: "main" } });

        expect((await getClipboardContent(result)).canPaste).toBe(false);
    });
});
