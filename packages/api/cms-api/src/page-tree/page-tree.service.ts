import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { DextinityValidationException } from "../common/errors/validation.exception";
import { RedirectsService } from "../redirects/redirects.service";
import { AttachedDocumentStrictInput } from "./dto/attached-document.input";
import { MovePageTreeNodesByPosInput, PageTreeNodeBaseCreateInput } from "./dto/page-tree-node.input";
import { AttachedDocument } from "./entities/attached-document.entity";
import { PAGE_TREE_CONFIG, PAGE_TREE_REPOSITORY } from "./page-tree.constants";
import { PageTreeConfig } from "./page-tree.module";
import { createReadApi, PageTreeReadApi } from "./page-tree-read-api";
import {
    PageTreeNodeCategory,
    PageTreeNodeInterface,
    PageTreeNodeUpdateInputInterface,
    PageTreeNodeVisibility,
    PageTreeNodeVisibility as Visibility,
    ScopeInterface,
} from "./types";

export { PageTreeReadApi } from "./page-tree-read-api";

@Injectable()
export class PageTreeService {
    constructor(
        @Inject(forwardRef(() => PAGE_TREE_REPOSITORY)) public readonly pageTreeRepository: EntityRepository<PageTreeNodeInterface>,
        @InjectRepository(AttachedDocument) public readonly attachedDocumentsRepository: EntityRepository<AttachedDocument>,
        private readonly entityManager: EntityManager,
        private readonly redirectsService: RedirectsService,
        @Inject(PAGE_TREE_CONFIG) private readonly config: PageTreeConfig,
    ) {}

    async createNode(input: PageTreeNodeBaseCreateInput, category: PageTreeNodeCategory, scope?: ScopeInterface): Promise<PageTreeNodeInterface> {
        // TODO: check for unique id
        const readApi = this.createReadApi({ visibility: "all" });

        if (input.id && input.parentId && input.id === input.parentId) {
            throw new DextinityValidationException("A page cannot be its own parent");
        }

        const path = await this.pathForParentAndSlug(input.parentId || null, input.slug);

        if (this.config.reservedPaths.includes(path)) {
            throw new DextinityValidationException("Reserved path");
        }

        const nodeWithSamePath = await this.nodeWithSamePath(path, scope);
        if (nodeWithSamePath) {
            throw new DextinityValidationException("Slug leads to duplicate path");
        }

        const { attachedDocument: attachedDocumentInput, parentId, ...restInput } = input;

        const siblingNodeWithHighestPosition = await this.pageTreeRepository
            .createQueryBuilder()
            .where({
                parentId: parentId ?? null,
                scope,
            })
            .orderBy({ pos: "DESC" })
            .getSingleResult();

        // insert newly created nodes at the last position
        const pos = siblingNodeWithHighestPosition ? siblingNodeWithHighestPosition.pos + 1 : 1;
        const parent = parentId ? await this.pageTreeRepository.findOneOrFail(parentId) : undefined;
        const newNode = this.pageTreeRepository.create({
            ...restInput,
            parent,
            parentId,
            pos,
            visibility: input.slug === "home" ? Visibility.Published : Visibility.Unpublished,
            scope,
            category,
            documentType: attachedDocumentInput.type,
        });
        await this.entityManager.persistAndFlush(newNode);

        if (attachedDocumentInput.id) {
            await this.entityManager.persistAndFlush(
                this.attachedDocumentsRepository.create({
                    pageTreeNodeId: newNode.id,
                    type: attachedDocumentInput.type,
                    documentId: attachedDocumentInput.id,
                }),
            );
        }

        return readApi.getNodeOrFail(newNode.id);
    }

    async updateNode(id: string, input: PageTreeNodeUpdateInputInterface): Promise<PageTreeNodeInterface> {
        const readApi = this.createReadApi({ visibility: "all" });

        const existingNode = await readApi.getNodeOrFail(id);
        if (!existingNode) {
            throw new Error("Can't find page-tree-node with id");
        }

        if (existingNode.slug === "home" && input.slug !== "home") {
            throw new Error(`Slug of page "home" cannot be changed`);
        }

        if (input.createAutomaticRedirectsOnSlugChange && existingNode.slug != input.slug) {
            await this.redirectsService.createAutomaticRedirects(existingNode);
        }

        const existingNodePath = await readApi.nodePath(existingNode);
        const newPath = this.newPathForSlug(existingNodePath, input.slug);

        if (this.config.reservedPaths.includes(newPath)) {
            throw new DextinityValidationException("Reserved path");
        }

        const nodeWithSamePath = await this.nodeWithSamePath(newPath, existingNode.scope);

        if (nodeWithSamePath && nodeWithSamePath.id !== id) {
            throw new DextinityValidationException("Slug leads to duplicate path");
        }

        const { attachedDocument: attachedDocumentInput, createAutomaticRedirectsOnSlugChange, ...restInput } = input;

        existingNode.assign(restInput);

        if (attachedDocumentInput) {
            existingNode.assign({ documentType: attachedDocumentInput.type });

            // check if attached document exists
            if (attachedDocumentInput.id) {
                const document = await this.resolveDocument(attachedDocumentInput.type, attachedDocumentInput.id);
                if (!document) {
                    throw new Error(`The assigned document does not exist or is not of type ${attachedDocumentInput.type}`);
                }

                // check if document is already attached and attach if not
                const attachedDocument = await this.attachedDocumentsRepository.findOne({ pageTreeNodeId: id, documentId: attachedDocumentInput.id });
                if (!attachedDocument) {
                    this.entityManager.persist(
                        this.attachedDocumentsRepository.create({
                            pageTreeNodeId: id,
                            type: attachedDocumentInput.type,
                            documentId: attachedDocumentInput.id,
                        }),
                    );
                }
            }
        }

        await this.entityManager.flush();

        return readApi.getNodeOrFail(id); // refresh data
    }

    async updateNodeVisibility(id: string, newVisibility: Visibility): Promise<void> {
        const node = await this.createReadApi({ visibility: "all" }).getNodeOrFail(id);

        if (node.slug === "home" && newVisibility !== PageTreeNodeVisibility.Published) {
            throw new Error(`Page "home" cannot be ${newVisibility.toLowerCase()}`);
        }

        let changedSlug: string | undefined = undefined;
        if (node.visibility === PageTreeNodeVisibility.Archived && newVisibility !== PageTreeNodeVisibility.Archived) {
            const readApi = this.createReadApi({ visibility: "all" });
            const existingNodePath = await readApi.nodePath(node);
            const slug = node.slug;

            let slugIncrement = 0;

            while (true) {
                const nextSlugToTest = slugIncrement ? `${slug}-${slugIncrement}` : slug;

                const newPath = this.newPathForSlug(existingNodePath, nextSlugToTest);
                const nodeWithSamePath = await this.nodeWithSamePath(newPath, node.scope);

                if (!nodeWithSamePath) {
                    break;
                }
                slugIncrement++;
            }
            changedSlug = slugIncrement ? `${slug}-${slugIncrement}` : slug;
        }

        node.assign({ visibility: newVisibility, slug: changedSlug ?? node.slug });

        // TODO flush shouldn't happen here, remove in a major version
        await this.entityManager.flush();
    }

    async updateNodePosition(id: string, input: MovePageTreeNodesByPosInput): Promise<PageTreeNodeInterface> {
        const readApi = this.createReadApi({ visibility: "all" });
        const existingNode = await readApi.getNodeOrFail(id);
        if (!existingNode) {
            throw new Error("Can't find page-tree-node with id");
        }

        if (input.parentId) {
            let currentParentId: string | null = input.parentId;
            while (currentParentId !== null) {
                if (currentParentId === id) {
                    throw new DextinityValidationException("A page cannot be its own parent or be moved under one of its descendants");
                }
                const parentNode = await readApi.getNode(currentParentId);
                if (!parentNode) {
                    break;
                }
                currentParentId = parentNode.parentId;
            }
        }

        const requestedPath = await this.pathForParentAndSlug(input.parentId, existingNode.slug);

        if (this.config.reservedPaths.includes(requestedPath)) {
            throw new DextinityValidationException("Reserved path");
        }

        let newSlug;
        const nodeWithSamePath = await this.nodeWithSamePath(requestedPath, existingNode.scope);
        if (nodeWithSamePath && nodeWithSamePath.id !== existingNode.id) {
            newSlug = await this.findNextAvailableSlug(existingNode.slug, input.parentId, existingNode.scope);
        }

        const parentId = input.parentId;

        if (input.pos !== existingNode.pos || input.parentId !== existingNode.parentId) {
            const parent = parentId ? await this.pageTreeRepository.findOneOrFail(parentId) : null;
            await this.entityManager.persistAndFlush(existingNode.assign({ parent, parentId, pos: input.pos, slug: newSlug ?? existingNode.slug }));

            const qb = this.pageTreeRepository
                .createQueryBuilder()
                .select(["id", "pos"])
                .where({
                    pos: { $gte: input.pos },
                    id: { $ne: id },
                    parentId,
                });

            if (parentId) {
                qb.andWhere({ parentId });
            }

            if (existingNode.scope) {
                qb.andWhere({ scope: existingNode.scope });
            }

            const nodesToIncrement = await qb.getResultList();
            await this.entityManager.persistAndFlush(nodesToIncrement.map((c) => c.assign({ pos: c.pos + 1 })));
        }

        return readApi.getNodeOrFail(existingNode.id);
    }

    async updateNodeSlug(id: string, slug: string): Promise<PageTreeNodeInterface> {
        const pageTreeReadApi = this.createReadApi({
            visibility: "all",
        });

        const node = await pageTreeReadApi.getNodeOrFail(id);

        if (node.slug === "home" && slug !== "home") {
            throw new Error(`Slug of page "home" cannot be changed`);
        }

        const requestedPath = await this.pathForParentAndSlug(node.parentId, slug);
        const nodeWithSamePath = await this.nodeWithSamePath(requestedPath, node.scope);
        if (nodeWithSamePath && nodeWithSamePath.id !== node.id) {
            throw new Error("Requested slug is already taken");
        }

        await this.entityManager.persistAndFlush(node.assign({ slug: slug }));

        return pageTreeReadApi.getNodeOrFail(id);
    }

    async updateCategory(id: string, category: PageTreeNodeCategory): Promise<void> {
        const readApi = this.createReadApi({ visibility: "all" });

        const node = await readApi.getNodeOrFail(id);

        if (!node) {
            throw new Error("Can't find page-tree-node with id");
        }

        const descendants = await readApi.getDescendants(node);

        await this.pageTreeRepository
            .createQueryBuilder()
            .update({ category })
            .where({ id: { $in: descendants.map((node) => node.id) } })
            .execute();

        const rootNodes = await readApi.pageTreeRootNodeList({ category, scope: node.scope });

        // 0 is added to avoid negative infinity for empty array
        const lastPosition = Math.max(0, ...rootNodes.map((node) => node.pos)) + 1;

        await this.entityManager.persistAndFlush(node.assign({ category, parent: null, parentId: null, pos: lastPosition }));
    }

    async delete(pageTreeNode: PageTreeNodeInterface): Promise<boolean> {
        if (pageTreeNode.slug === "home") {
            throw new Error(`Page "home" cannot be deleted`);
        }

        const readApi = this.createReadApi();
        const childNodes = await readApi.getChildNodes(pageTreeNode);

        // recursively delete all child nodes
        for (const childNode of childNodes) {
            await this.delete(childNode);
        }

        // 1. Delete all attached documents
        const attachedDocuments = await this.attachedDocumentsRepository.find({ pageTreeNodeId: pageTreeNode.id });
        for (const attachedDocument of attachedDocuments) {
            if (attachedDocument.id) {
                try {
                    const repository = this.entityManager.getRepository(attachedDocument.type);
                    const document = await repository.findOneOrFail(attachedDocument.documentId);
                    await this.entityManager.removeAndFlush(document);
                    await this.entityManager.removeAndFlush(attachedDocument);
                } catch {
                    throw new Error(`documentType ${attachedDocument.type} and documentId ${attachedDocument.id} cannot resolve`);
                }
            }
        }

        // 2. Delete page tree node itself
        try {
            await this.entityManager.removeAndFlush(pageTreeNode);
            return true;
        } catch {
            return false;
        }
    }

    async resolveDocument(documentType: string, documentId: string): Promise<unknown | null> {
        try {
            const repository = this.entityManager.getRepository(documentType);
            const document = await repository.findOne(documentId);
            return document ?? null;
        } catch {
            throw new Error(`documentType ${documentType} and documentId ${documentId} cannot resolve`);
        }
    }

    async getAttachedDocuments(pageTreeNodeId: string): Promise<AttachedDocument[]> {
        return this.attachedDocumentsRepository.find({ pageTreeNodeId: pageTreeNodeId });
    }

    async getActiveAttachedDocument(pageTreeNodeId: string, activeType: string): Promise<AttachedDocument | null> {
        const node = await this.pageTreeRepository.findOneOrFail(pageTreeNodeId);

        if (node.documentType !== activeType) {
            return null;
        }

        const activeDocument = await this.attachedDocumentsRepository.findOne({ pageTreeNodeId: pageTreeNodeId, type: activeType });
        if (!activeDocument) {
            return null;
        }

        return activeDocument;
    }

    async attachDocument(attachedDocumentInput: AttachedDocumentStrictInput, pageTreeId: string): Promise<void> {
        const node = await this.pageTreeRepository.findOne(pageTreeId);
        if (!node) {
            throw new Error(`Can't find page-tree-node with id ${pageTreeId}`);
        }
        const resolvedDocument = await this.resolveDocument(attachedDocumentInput.type, attachedDocumentInput.id);
        if (!resolvedDocument) {
            throw new Error(`The assigned document does not exist or is not of type ${attachedDocumentInput.type}`);
        }

        // check if document is already attached and attach if not
        const attachedDocument = await this.attachedDocumentsRepository.findOne({ pageTreeNodeId: node.id, documentId: attachedDocumentInput.id });

        if (!attachedDocument) {
            this.entityManager.persist(
                this.attachedDocumentsRepository.create({
                    pageTreeNodeId: node.id,
                    type: attachedDocumentInput.type,
                    documentId: attachedDocumentInput.id,
                }),
            );
        }
    }

    public async pathForParentAndSlug(parentId: null | string, slug: string): Promise<string> {
        const readApi = this.createReadApi({ visibility: "all" });

        let parentPath = parentId ? await readApi.nodePathById(parentId) : "";

        if (parentPath === "/") {
            parentPath = "/home";
        }

        return `${parentPath}/${slug}`;
    }

    public async nodeWithSamePath(path: string, scope?: ScopeInterface): Promise<PageTreeNodeInterface | null> {
        // The home page has the slug "home" but lives at the canonical path "/". getNodeByPath("/home") returns null by
        // design, so the home page must be looked up via "/" to detect it as a duplicate (e.g. when copying it).
        const lookupPath = path === "/home" ? "/" : path;
        return this.createReadApi({ visibility: [Visibility.Published, Visibility.Unpublished] }).getNodeByPath(lookupPath, {
            scope,
        }); // Slugs of archived pages can be reused
    }

    createReadApi(
        options: {
            visibility?: Visibility | Visibility[] | "all";
        } = {},
    ): PageTreeReadApi {
        return createReadApi(
            {
                pageTreeNodeRepository: this.pageTreeRepository,
                attachedDocumentsRepository: this.attachedDocumentsRepository,
            },
            options,
        );
    }

    private newPathForSlug(existingNodePath: string, slug: string): string {
        const parentPath = existingNodePath.split("/").slice(0, -1).join("/");
        const newPath = `${parentPath || ""}/${slug}`;
        return newPath;
    }

    private async findNextAvailableSlug(slug: string, parentId: string | null = null, scope?: ScopeInterface): Promise<string> {
        let counter = 1;
        let newSlug, newPath;

        do {
            newSlug = `${slug}-${counter}`;
            newPath = await this.pathForParentAndSlug(parentId, newSlug);

            counter++;
        } while (await this.nodeWithSamePath(newPath, scope));

        return newSlug;
    }
}
