import {
    type BlockDataInterface,
    BlocksTransformerService,
    BuildsService,
    type ExtractBlockInputFactoryProps,
    getRequestContextHeadersFromRequest,
    PageTreeNodeVisibility,
    PageTreeService,
    type RequestContextInterface,
} from "@dextinity/cms-api";
import { EntityManager, NotFoundError } from "@mikro-orm/postgresql";
import { Inject, Injectable, Logger, Scope } from "@nestjs/common";
import { CONTEXT } from "@nestjs/graphql";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block.js";
import { SeoBlock } from "@src/documents/pages/blocks/seo.block.js";
import { StageBlock } from "@src/documents/pages/blocks/stage.block.js";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PagesService } from "@src/documents/pages/pages.service.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import type { Request } from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { allowedScope, createMcpTestApp, createOrmProvider } from "./mcp.test-helper.js";

const transformedBlocks: { blockContext: unknown; requestContext: RequestContextInterface | undefined }[] = [];

// Stands in for the service of a block transformer, such as the `PageTreeReadApiService` an internal link resolves its
// target with: request-scoped, and reading its context off the request the real `BlocksTransformerService` resolves it
// under.
@Injectable({ scope: Scope.REQUEST })
class RequestScopedBlockTransformerService {
    private readonly requestContext?: RequestContextInterface;

    constructor(@Inject(CONTEXT) context: { req?: Request } | undefined) {
        this.requestContext = context?.req ? getRequestContextHeadersFromRequest(context.req) : undefined;
    }

    async transformToPlain(_block: unknown, blockContext: unknown) {
        transformedBlocks.push({ blockContext, requestContext: this.requestContext });
        return { transformed: true };
    }
}

const deletedNewsId = "0190a5f4-0000-7000-8000-000000000031";

// Stands in for the service of a block transformer that loads the target of a link, such as a news link to a deleted news entry.
@Injectable()
class DeletedLinkTargetBlockTransformerService {
    async transformToPlain() {
        throw NotFoundError.findOneFailed("News", deletedNewsId);
    }
}

function createBlockData(transformerService: unknown = RequestScopedBlockTransformerService) {
    return { transformToPlain: () => transformerService, transformToSave: () => ({}) };
}

const homeNode = { id: "0190a5f4-0000-7000-8000-000000000001", name: "Home", slug: "home", documentType: "Page", scope: allowedScope };
const otherScopeNode = {
    id: "0190a5f4-0000-7000-8000-000000000002",
    name: "Other",
    slug: "other",
    documentType: "Page",
    scope: { domain: "secondary", language: "en" },
};
const aboutNode = { id: "0190a5f4-0000-7000-8000-000000000003", slug: "about", visibility: "Published", documentType: "Page", scope: allowedScope };
const archivedNode = { id: "0190a5f4-0000-7000-8000-000000000004", slug: "old", visibility: "Archived", documentType: "Page", scope: allowedScope };
const newNode = { id: "0190a5f4-0000-7000-8000-000000000005", slug: "new", visibility: "Unpublished", documentType: "Page", scope: allowedScope };
const nodes = [homeNode, otherScopeNode, aboutNode, archivedNode, newNode];
const pages = [
    { id: "0190a5f4-0000-7000-8000-000000000011", node: homeNode, content: createBlockData(), stage: createBlockData(), seo: createBlockData() },
    {
        id: "0190a5f4-0000-7000-8000-000000000012",
        node: otherScopeNode,
        content: createBlockData(),
        stage: createBlockData(),
        seo: createBlockData(),
    },
    { id: "0190a5f4-0000-7000-8000-000000000013", node: null, content: createBlockData(), stage: createBlockData(), seo: createBlockData() },
    {
        id: "0190a5f4-0000-7000-8000-000000000014",
        node: homeNode,
        content: createBlockData(DeletedLinkTargetBlockTransformerService),
        stage: createBlockData(),
        seo: createBlockData(),
    },
];
const unknownId = "0190a5f4-0000-7000-8000-000000000099";

// The page of `aboutNode`, which the specs of `save_page` save.
const aboutPageId = "0190a5f4-0000-7000-8000-000000000015";
let aboutPage: { id: string; updatedAt: Date; content?: BlockDataInterface; stage?: BlockDataInterface; seo?: BlockDataInterface };

const pagesService = {
    savePage: vi.fn(async ({ pageId }: { pageId: string }) => {
        aboutPage = { id: pageId, updatedAt: new Date("2026-11-16T12:00:00.000Z") };
        return aboutPage;
    }),
};

const buildsService = { setChangesSinceLastBuild: vi.fn(async () => undefined) };

const validPage = {
    content: { blocks: [] },
    stage: { blocks: [] },
    seo: {
        openGraphImage: { visible: false },
        noIndex: false,
        priority: "0_5",
        changeFrequency: "weekly",
        alternativeLinks: [],
    },
};

const readApi = {
    getNodeOrFail: async (id: string) => nodes.find((node) => node.id === id),
    getFirstNodeByAttachedPageId: async (pageId: string) => pages.find((page) => page.id === pageId)?.node ?? null,
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
};

let mcpTestApp: Awaited<ReturnType<typeof createMcpTestApp>>;

beforeAll(async () => {
    mcpTestApp = await createMcpTestApp([
        BlocksTransformerService,
        RequestScopedBlockTransformerService,
        DeletedLinkTargetBlockTransformerService,
        {
            provide: PageTreeService,
            useValue: {
                createReadApi: () => readApi,
                getActiveAttachedDocument: async (nodeId: string) => (nodeId === aboutNode.id ? { documentId: aboutPageId } : null),
            },
        },
        {
            provide: EntityManager,
            useValue: {
                findOne: async (_: unknown, id: string) => (id === aboutPage.id ? aboutPage : (pages.find((page) => page.id === id) ?? null)),
            },
        },
        { provide: PagesService, useValue: pagesService },
        { provide: BuildsService, useValue: buildsService },
        createOrmProvider(
            new Map<unknown, { id: string }[]>([
                [PageTreeNode, nodes],
                [Page, pages],
            ]),
        ),
    ]);
});

beforeEach(() => {
    transformedBlocks.length = 0;
    aboutPage = { id: aboutPageId, updatedAt: new Date("2026-11-16T10:00:00.000Z") };
    vi.clearAllMocks();
});

afterAll(async () => {
    await mcpTestApp?.close();
});

describe("PageTools", () => {
    it("answers get_page with the blocks transformed as the admin's editor sees them", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_page", { id: pages[0].id });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({
            id: pages[0].id,
            pageTreeNode: { id: homeNode.id, path: "/home" },
            content: { transformed: true },
            stage: { transformed: true },
            seo: { transformed: true },
        });
        expect(transformedBlocks).toHaveLength(3);
        for (const { blockContext, requestContext } of transformedBlocks) {
            expect(blockContext).toEqual({ includeInvisibleContent: true, previewDamUrls: true });
            // So that internal links to unpublished and archived pages resolve to their target, as in the admin.
            expect(requestContext?.includeInvisiblePages).toEqual(
                expect.arrayContaining([PageTreeNodeVisibility.Unpublished, PageTreeNodeVisibility.Archived]),
            );
        }
    });

    it.each([
        ["of a scope the user may not read", pages[1].id],
        ["that doesn't exist", unknownId],
        ["that isn't attached to a page tree node", pages[2].id],
    ])("answers a page %s as if it didn't exist", async (_, id) => {
        const { text, isError } = await mcpTestApp.callTool("get_page", { id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page ${id}.`);
        expect(transformedBlocks).toEqual([]);
    });

    it("doesn't answer a page whose link target is missing as if the page didn't exist", async () => {
        const logError = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

        const { text, isError } = await mcpTestApp.callTool("get_page", { id: pages[3].id });

        expect(isError).toBe(true);
        expect(text).toBe("Internal server error");
        expect(logError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining(deletedNewsId) }));
        logError.mockRestore();
    });
});

describe("PageTools that save pages", () => {
    it("asks the user to approve every save", async () => {
        const tools = await mcpTestApp.listTools();
        const annotations = Object.fromEntries(tools.map(({ name, annotations }) => [name, annotations ?? {}]));

        expect(annotations.get_page_input.readOnlyHint).toBe(true);
        expect(annotations.save_page.readOnlyHint).toBe(false);
    });

    it("takes a saved page back as get_page_input returns it, an image included", async () => {
        const openGraphImage = { block: { damFileId: "0190a5f4-0000-7000-8000-000000000021" }, visible: true };
        aboutPage = {
            ...aboutPage,
            content: PageContentBlock.blockInputFactory(validPage.content).transformToBlockData(),
            stage: StageBlock.blockInputFactory(validPage.stage).transformToBlockData(),
            seo: SeoBlock.blockInputFactory({ ...validPage.seo, openGraphImage } as ExtractBlockInputFactoryProps<
                typeof SeoBlock
            >).transformToBlockData(),
        };

        const read = await mcpTestApp.callTool("get_page_input", { pageTreeNodeId: aboutNode.id });
        expect(read.isError).toBe(false);
        const page = JSON.parse(read.text);
        expect(page).toMatchObject({ id: aboutPageId, updatedAt: "2026-11-16T10:00:00.000Z", seo: { openGraphImage } });

        const saved = await mcpTestApp.callTool("save_page", {
            pageTreeNodeId: aboutNode.id,
            lastUpdatedAt: page.updatedAt,
            content: page.content,
            stage: page.stage,
            seo: page.seo,
        });
        expect(saved).toMatchObject({ isError: false });
    });

    it("answers get_page_input for a node without a saved page with how to create one", async () => {
        const { text, isError } = await mcpTestApp.callTool("get_page_input", { pageTreeNodeId: newNode.id });

        expect(isError).toBe(true);
        expect(text).toContain('passing null as "lastUpdatedAt"');
    });

    it("saves the page of the node and answers with its new updatedAt for the next save", async () => {
        const first = await mcpTestApp.callTool("save_page", {
            pageTreeNodeId: aboutNode.id,
            lastUpdatedAt: "2026-11-16T10:00:00.000Z",
            ...validPage,
        });

        expect(first.isError).toBe(false);
        expect(JSON.parse(first.text)).toEqual({ id: aboutPageId, pageTreeNodeId: aboutNode.id, updatedAt: "2026-11-16T12:00:00.000Z" });
        expect(pagesService.savePage).toHaveBeenCalledWith(expect.objectContaining({ pageId: aboutPageId, attachedPageTreeNodeId: aboutNode.id }));
        const [{ input }] = pagesService.savePage.mock.calls[0] as unknown as [{ input: { content: { transformToBlockData: () => unknown } } }];
        expect(input.content.transformToBlockData()).toEqual({ blocks: [] });

        const second = await mcpTestApp.callTool("save_page", {
            pageTreeNodeId: aboutNode.id,
            lastUpdatedAt: JSON.parse(first.text).updatedAt,
            ...validPage,
        });
        expect(second.isError).toBe(false);
    });

    it("refuses to overwrite a page that was changed since the agent read it", async () => {
        const { text, isError } = await mcpTestApp.callTool("save_page", {
            pageTreeNodeId: aboutNode.id,
            lastUpdatedAt: "2026-11-16T09:00:00.000Z",
            ...validPage,
        });

        expect(isError).toBe(true);
        expect(text).toContain("The page was changed since you read it.");
        expect(pagesService.savePage).not.toHaveBeenCalled();
        expect(buildsService.setChangesSinceLastBuild).not.toHaveBeenCalled();
    });

    it("refuses to replace a saved page without the updatedAt the agent read", async () => {
        const { text, isError } = await mcpTestApp.callTool("save_page", { pageTreeNodeId: aboutNode.id, lastUpdatedAt: null, ...validPage });

        expect(isError).toBe(true);
        expect(text).toContain("already has a saved page");
    });

    it("creates the page of a node that has none yet", async () => {
        const { isError } = await mcpTestApp.callTool("save_page", { pageTreeNodeId: newNode.id, lastUpdatedAt: null, ...validPage });

        expect(isError).toBe(false);
        expect(pagesService.savePage).toHaveBeenCalledWith(expect.objectContaining({ attachedPageTreeNodeId: newNode.id }));
        expect(pagesService.savePage.mock.calls[0][0].pageId).not.toBe(aboutPageId);
        expect(buildsService.setChangesSinceLastBuild).toHaveBeenCalledWith(allowedScope);
    });

    it("refuses to save the page of an archived node", async () => {
        const { text, isError } = await mcpTestApp.callTool("save_page", { pageTreeNodeId: archivedNode.id, lastUpdatedAt: null, ...validPage });

        expect(isError).toBe(true);
        expect(text).toContain("is archived and can't be changed");
    });

    it("answers the page of a node of a scope the user may not change as if it didn't exist", async () => {
        const { text, isError } = await mcpTestApp.callTool("save_page", { pageTreeNodeId: otherScopeNode.id, lastUpdatedAt: null, ...validPage });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page tree node ${otherScopeNode.id}.`);
    });

    it("reports an invalid block with the path of the invalid value", async () => {
        const { text, isError } = await mcpTestApp.callTool("save_page", {
            pageTreeNodeId: aboutNode.id,
            lastUpdatedAt: "2026-11-16T10:00:00.000Z",
            ...validPage,
            seo: { ...validPage.seo, priority: "urgent" },
        });

        expect(isError).toBe(true);
        expect(text).toContain('"path": "seo.priority"');
        expect(pagesService.savePage).not.toHaveBeenCalled();
    });
});
