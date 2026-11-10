import { createMock } from "@golevelup/ts-vitest";
import type { EntityManager } from "@mikro-orm/postgresql";
import { describe, expect, it, vi } from "vitest";

import type { DocumentInterface } from "../document/dto/document-interface";
import { AttachedDocument } from "./entities/attached-document.entity";
import type { PageTreeService } from "./page-tree.service";
import { PageTreeNodeDocumentEntityScopeService } from "./page-tree-node-document-entity-scope.service";

const scope = { domain: "main", language: "en" };
const document = { id: "document-1" } as DocumentInterface;

const attachedDocument = (documentId: string, pageTreeNodeId: string) => Object.assign(new AttachedDocument(), { documentId, pageTreeNodeId });

const createService = ({ pendingEntities = [], savedNodeScope }: { pendingEntities?: object[]; savedNodeScope?: object } = {}) => {
    const readApi = {
        getNode: vi.fn(async (id: string) => ({ id, scope })),
        getFirstNodeByAttachedPageId: vi.fn(async () => (savedNodeScope ? { id: "saved-node", scope: savedNodeScope } : null)),
    };
    const service = new PageTreeNodeDocumentEntityScopeService(
        createMock<PageTreeService>({ createReadApi: () => readApi as never }),
        createMock<EntityManager>({ getUnitOfWork: () => ({ getPersistStack: () => new Set(pendingEntities) }) as never }),
    );
    return { service, readApi };
};

describe("PageTreeNodeDocumentEntityScopeService", () => {
    it("takes the scope from the saved attachment of the document", async () => {
        const { service, readApi } = createService({ savedNodeScope: { domain: "secondary", language: "de" } });

        await expect(service.getEntityScope(document)).resolves.toEqual({ domain: "secondary", language: "de" });
        expect(readApi.getFirstNodeByAttachedPageId).toHaveBeenCalledWith("document-1");
    });

    it("takes the scope from an attachment that is not saved yet", async () => {
        const { service, readApi } = createService({ pendingEntities: [attachedDocument("document-1", "pending-node")] });

        await expect(service.getEntityScope(document)).resolves.toEqual(scope);
        expect(readApi.getNode).toHaveBeenCalledWith("pending-node");
        expect(readApi.getFirstNodeByAttachedPageId).not.toHaveBeenCalled();
    });

    it("ignores attachments that are not saved yet and belong to another document", async () => {
        const { service, readApi } = createService({
            pendingEntities: [attachedDocument("document-2", "other-node")],
            savedNodeScope: { domain: "secondary", language: "de" },
        });

        await expect(service.getEntityScope(document)).resolves.toEqual({ domain: "secondary", language: "de" });
        expect(readApi.getNode).not.toHaveBeenCalled();
    });

    it("rejects a document that is not attached to a page tree node", async () => {
        const { service } = createService();

        await expect(service.getEntityScope(document)).rejects.toThrow("PageTreeNode not found for document with id: document-1");
    });
});
