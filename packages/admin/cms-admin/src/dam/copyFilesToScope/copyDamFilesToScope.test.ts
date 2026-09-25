import type { ApolloClient } from "@apollo/client";
import type { DocumentNode, OperationDefinitionNode } from "graphql";
import { describe, expect, it, vi } from "vitest";

import { copyDamFilesToScope } from "./copyDamFilesToScope";

const operationName = (document: DocumentNode) => (document.definitions[0] as OperationDefinitionNode).name?.value;

function createMockApolloClient({ existingCopies = {} }: { existingCopies?: Record<string, string> } = {}) {
    const query = vi.fn(async ({ variables }: { variables: { id: string } }) => ({
        data: { findCopiesOfFileInScope: existingCopies[variables.id] ? [{ id: existingCopies[variables.id] }] : [] },
    }));

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

    return { client: { query, mutate } as unknown as ApolloClient<unknown>, query, mutate };
}

const targetDamScope = { domain: "secondary" };
const sourceScope = { domain: "main" };

describe("copyDamFilesToScope", () => {
    it("doesn't copy anything when the DAM isn't scoped", async () => {
        const { client, query, mutate } = createMockApolloClient();

        const replacements = await copyDamFilesToScope({ client, files: [{ id: "file-1", scope: sourceScope }], targetDamScope: {} });

        expect(replacements).toEqual([]);
        expect(query).not.toHaveBeenCalled();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("doesn't copy files that already live in the target scope", async () => {
        const { client, query, mutate } = createMockApolloClient();

        const replacements = await copyDamFilesToScope({ client, files: [{ id: "file-1", scope: targetDamScope }], targetDamScope });

        expect(replacements).toEqual([]);
        expect(query).not.toHaveBeenCalled();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("reuses an existing copy in the target scope", async () => {
        const { client, mutate } = createMockApolloClient({ existingCopies: { "file-1": "existing-copy" } });

        const replacements = await copyDamFilesToScope({ client, files: [{ id: "file-1", scope: sourceScope }], targetDamScope });

        expect(replacements).toEqual([{ type: "DamFile", originalId: "file-1", replaceWithId: "existing-copy" }]);
        expect(mutate).not.toHaveBeenCalled();
    });

    it("copies all remaining files into a single inbox folder", async () => {
        const { client, mutate } = createMockApolloClient({ existingCopies: { "file-2": "existing-copy" } });

        const replacements = await copyDamFilesToScope({
            client,
            files: [
                { id: "file-1", scope: sourceScope },
                { id: "file-2", scope: sourceScope },
                { id: "file-3", scope: sourceScope },
            ],
            targetDamScope,
        });

        expect(replacements).toEqual([
            { type: "DamFile", originalId: "file-2", replaceWithId: "existing-copy" },
            { type: "DamFile", originalId: "file-1", replaceWithId: "file-1-copy" },
            { type: "DamFile", originalId: "file-3", replaceWithId: "file-3-copy" },
        ]);
        expect(mutate).toHaveBeenCalledTimes(2);
        expect(operationName(mutate.mock.calls[0][0].mutation)).toBe("CreateInboxFolder");
        expect(mutate.mock.calls[1][0].variables.fileIds).toEqual(["file-1", "file-3"]);
    });

    it("handles a file that is used multiple times only once", async () => {
        const { client, query, mutate } = createMockApolloClient();

        const replacements = await copyDamFilesToScope({
            client,
            files: [
                { id: "file-1", scope: sourceScope },
                { id: "file-1", scope: sourceScope },
            ],
            targetDamScope,
        });

        expect(replacements).toEqual([{ type: "DamFile", originalId: "file-1", replaceWithId: "file-1-copy" }]);
        expect(query).toHaveBeenCalledTimes(1);
        expect(mutate.mock.calls[1][0].variables.fileIds).toEqual(["file-1"]);
    });

    it("reports the progress", async () => {
        const { client } = createMockApolloClient();
        const updateProgress = vi.fn();

        await copyDamFilesToScope({ client, files: [{ id: "file-1", scope: sourceScope }], targetDamScope, updateProgress });

        expect(updateProgress).toHaveBeenLastCalledWith(1);
    });
});
