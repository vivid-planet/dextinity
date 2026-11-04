import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";

import { AttachedDocument } from "./entities/attached-document.entity";
import { PageTreeNodeInterface } from "./types";

@Injectable({ scope: Scope.REQUEST })
export class AttachedDocumentLoaderService {
    private dataLoader: DataLoader<string, unknown | null>;
    constructor(
        @InjectRepository(AttachedDocument) public readonly attachedDocumentsRepository: EntityRepository<AttachedDocument>,
        private readonly em: EntityManager,
    ) {
        this.dataLoader = new DataLoader<string, unknown | null>(async (keys): Promise<unknown[]> => {
            const documentsMap = new Map<string, unknown | null>();

            const attachedDocumentsByType: Record<string, AttachedDocument[]> = {};
            const attachedDocumentsByKey = new Map<string, AttachedDocument>();
            for (const attachedDocument of await this.attachedDocumentsRepository.find({
                $or: keys.map((key) => {
                    const [pageTreeNodeId, type] = key.split("$");
                    return {
                        pageTreeNodeId,
                        type,
                    };
                }),
            })) {
                if (!attachedDocumentsByType[attachedDocument.type]) {
                    attachedDocumentsByType[attachedDocument.type] = [];
                }
                attachedDocumentsByType[attachedDocument.type].push(attachedDocument);

                attachedDocumentsByKey.set(`${attachedDocument.pageTreeNodeId}$${attachedDocument.type}`, attachedDocument);
            }

            for (const [type, attachedDocuments] of Object.entries(attachedDocumentsByType)) {
                const repository = this.em.getRepository(type);
                for (const document of await repository.find(attachedDocuments.map((i) => i.documentId))) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    documentsMap.set((document as any).id, document);
                }
            }
            return keys.map((key) => {
                const attachedDocument = attachedDocumentsByKey.get(key);
                if (!attachedDocument) {
                    return null;
                }
                return documentsMap.get(attachedDocument.documentId) ?? null;
            });
        });
    }

    load(pageTreeNode: PageTreeNodeInterface): Promise<unknown> {
        return this.dataLoader.load(`${pageTreeNode.id}$${pageTreeNode.documentType}`);
    }
}
