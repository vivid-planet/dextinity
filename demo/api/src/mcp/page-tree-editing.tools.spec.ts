import {
    type BlockDataInterface,
    BuildsModule,
    BuildsService,
    type ContentScope,
    type CurrentUser,
    ExceptionFilter,
    type ExtractBlockInputFactoryProps,
    FilesService,
    getRequestFromExecutionContext,
    PAGE_TREE_CONFIG,
    PageTreeService,
    PageTreeSlugAvailability,
    UserPermissionsModule,
} from "@dextinity/cms-api";
import { EntityManager, MikroORM, NotFoundError } from "@mikro-orm/postgresql";
import type { Client } from "@modelcontextprotocol/client";
import { type CanActivate, type ExecutionContext, Global, type INestApplication, Injectable, Module, type Provider } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { connectMcpClient } from "@nestjs/mcp/testing";
import { Test } from "@nestjs/testing";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block.js";
import { SeoBlock } from "@src/documents/pages/blocks/seo.block.js";
import { StageBlock } from "@src/documents/pages/blocks/stage.block.js";
import { PagesModule } from "@src/documents/pages/pages.module.js";
import { PagesService } from "@src/documents/pages/pages.service.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AiModeMcpModule } from "./mcp.module.js";

// Calls the tools through an MCP client, past the permission checks of `UserPermissionsGuard` that they declare, with
// the services that change the data mocked.

const allowedScope = { domain: "main", language: "en" };
const otherScope = { domain: "secondary", language: "en" };

const editor = { id: "editor", name: "Editor" } as CurrentUser;

// Stands in for DextinityAuthGuard.
@Injectable()
class EditorAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = getRequestFromExecutionContext(context);
        if (!request) {
            return false;
        }
        request.user = editor;
        return true;
    }
}

const homeNode = { id: "0190a5f4-0000-7000-8000-000000000001", slug: "home", visibility: "Published", documentType: "Page", scope: allowedScope };
const aboutNode = { id: "0190a5f4-0000-7000-8000-000000000002", slug: "about", visibility: "Published", documentType: "Page", scope: allowedScope };
const archivedNode = { id: "0190a5f4-0000-7000-8000-000000000003", slug: "old", visibility: "Archived", documentType: "Page", scope: allowedScope };
const otherScopeNode = {
    id: "0190a5f4-0000-7000-8000-000000000004",
    slug: "other",
    visibility: "Published",
    documentType: "Page",
    scope: otherScope,
};
const newNode = { id: "0190a5f4-0000-7000-8000-000000000005", slug: "new", visibility: "Unpublished", documentType: "Page", scope: allowedScope };
const nodes = [homeNode, aboutNode, archivedNode, otherScopeNode, newNode];

const aboutPageId = "0190a5f4-0000-7000-8000-000000000012";
let aboutPage: { id: string; updatedAt: Date; content?: BlockDataInterface; stage?: BlockDataInterface; seo?: BlockDataInterface };

const readApi = {
    getNode: async (id: string) => nodes.find((node) => node.id === id) ?? null,
    getNodeOrFail: async (id: string) => nodes.find((node) => node.id === id),
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
};

const pageTreeService = {
    createReadApi: () => readApi,
    getActiveAttachedDocument: async (nodeId: string) => (nodeId === aboutNode.id ? { documentId: aboutPageId } : null),
    getSlugAvailability: vi.fn(async () => PageTreeSlugAvailability.Available),
    createNode: vi.fn(async () => newNode),
    updateNode: vi.fn(async () => undefined),
    updateNodeVisibility: vi.fn(async () => undefined),
    updateNodePosition: vi.fn(async () => undefined),
    delete: vi.fn(async () => true),
};

const pagesService = {
    savePage: vi.fn(async ({ pageId }: { pageId: string }) => {
        aboutPage = { id: pageId, updatedAt: new Date("2026-11-16T12:00:00.000Z") };
        return aboutPage;
    }),
};

const buildsService = { setChangesSinceLastBuild: vi.fn(async () => undefined) };

const accessControlService = {
    isAllowed: (user: CurrentUser, permission: string, scope?: ContentScope) =>
        permission === "aiHub" || (permission === "pageTree" && scope?.domain === allowedScope.domain),
};

// The rows `@AffectedEntity` reads the scope of.
const orm = {
    em: {
        findOneOrFail: async (entity: { name: string }, id: string) => {
            const row = entity === PageTreeNode ? nodes.find((candidate) => candidate.id === id) : undefined;
            if (!row) {
                throw NotFoundError.findOneFailed(entity.name, { id });
            }
            return row;
        },
        getMetadata: () => ({ get: () => ({ getPrimaryProps: () => [{ type: "uuid" }] }) }),
    },
};

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

// The package exports neither the guard that `UserPermissionsModule` registers globally nor the service it checks the
// scopes with, so they are taken from the module's own providers.
const userPermissionsProviders: Provider[] = Reflect.getMetadata("providers", UserPermissionsModule);
const userPermissionsGuardProvider = userPermissionsProviders.find((provider) => typeof provider === "object" && provider.provide === APP_GUARD);
const contentScopeServiceProvider = userPermissionsProviders.find(
    (provider) => typeof provider === "function" && provider.name === "ContentScopeService",
);
if (!userPermissionsGuardProvider || !contentScopeServiceProvider) {
    throw new Error("UserPermissionsModule no longer provides what the test takes from it");
}

const appProviders: Provider[] = [
    contentScopeServiceProvider,
    { provide: "access-control-service", useValue: accessControlService },
    { provide: "user-permissions-options", useValue: { systemUsers: [] } },
    { provide: MikroORM, useValue: orm },
    { provide: PageTreeService, useValue: pageTreeService },
    { provide: PAGE_TREE_CONFIG, useValue: { reservedPaths: [], allowPageDelete: true } },
    // For the other tools of the server.
    { provide: FilesService, useValue: {} },
    { provide: EntityManager, useValue: { findOne: async (_: unknown, id: string) => (id === aboutPage.id ? aboutPage : null) } },
];

// The services the tools get from the app's modules.
@Global()
@Module({ providers: appProviders, exports: appProviders })
class AppServicesModule {}

@Module({ providers: [{ provide: BuildsService, useValue: buildsService }], exports: [BuildsService] })
class MockBuildsModule {}

@Module({ providers: [{ provide: PagesService, useValue: pagesService }], exports: [PagesService] })
class MockPagesModule {}

let app: INestApplication;
let client: Client | undefined;

async function connectClient(): Promise<Client> {
    client ??= await connectMcpClient(app);
    return client;
}

async function callTool(name: string, args: Record<string, unknown>) {
    const result = await (await connectClient()).callTool({ name, arguments: args });
    const [content] = result.content as { type: "text"; text: string }[];
    return { text: content.text, isError: result.isError === true };
}

beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [AppServicesModule, AiModeMcpModule.forRoot({ adminUrl: "https://admin.example.com" })],
        providers: [{ provide: APP_GUARD, useClass: EditorAuthGuard }, userPermissionsGuardProvider],
    })
        .overrideModule(BuildsModule)
        .useModule(MockBuildsModule)
        .overrideModule(PagesModule)
        .useModule(MockPagesModule)
        .compile();

    app = moduleRef.createNestApplication();
    // As main.ts sets them up.
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new ExceptionFilter(false));
    await app.listen(0);
});

beforeEach(() => {
    aboutPage = { id: aboutPageId, updatedAt: new Date("2026-11-16T10:00:00.000Z") };
    vi.clearAllMocks();
});

afterAll(async () => {
    await client?.close();
    await app?.close();
});

describe("Tools of the MCP server that change the page tree", () => {
    it("asks the user to approve every call of a tool that changes content", async () => {
        const { tools } = await (await connectClient()).listTools();
        const annotations = Object.fromEntries(tools.map(({ name, annotations }) => [name, annotations ?? {}]));

        expect(annotations.check_slug_availability.readOnlyHint).toBe(true);
        expect(annotations.get_page_input.readOnlyHint).toBe(true);
        for (const tool of [
            "create_page_tree_node",
            "update_page_tree_node",
            "update_page_tree_node_visibility",
            "delete_page_tree_node",
            "save_page",
        ]) {
            expect(annotations[tool].readOnlyHint).toBe(false);
        }
        expect(annotations.delete_page_tree_node.destructiveHint).toBe(true);
    });

    it("answers check_slug_availability as the page tree service decides it", async () => {
        pageTreeService.getSlugAvailability.mockResolvedValueOnce(PageTreeSlugAvailability.Taken);
        const { text, isError } = await callTool("check_slug_availability", { scope: allowedScope, parentId: aboutNode.id, slug: "team" });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toEqual({ availability: "Taken" });
        expect(pageTreeService.getSlugAvailability).toHaveBeenCalledWith({ scope: allowedScope, parentId: aboutNode.id, slug: "team" });
    });

    it.each(["check_slug_availability", "create_page_tree_node"])("refuses %s in a scope the user may not change", async (tool) => {
        const { text, isError } = await callTool(tool, { scope: otherScope, name: "Team", slug: "team" });

        expect(isError).toBe(true);
        expect(text).toBe("You may not change the page tree of this scope.");
        expect(pageTreeService.createNode).not.toHaveBeenCalled();
    });

    it("refuses to create a node under a parent of another scope", async () => {
        const { text, isError } = await callTool("create_page_tree_node", {
            scope: allowedScope,
            parentId: otherScopeNode.id,
            name: "Team",
            slug: "team",
        });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page tree node ${otherScopeNode.id} in this scope.`);
    });

    it("refuses to create a node under an archived parent", async () => {
        const { text, isError } = await callTool("create_page_tree_node", {
            scope: allowedScope,
            parentId: archivedNode.id,
            name: "Team",
            slug: "team",
        });

        expect(isError).toBe(true);
        expect(text).toBe("An archived page tree node can't get child nodes.");
    });

    it("refuses an invalid slug with the reason the input validation gives", async () => {
        const { text, isError } = await callTool("create_page_tree_node", { scope: allowedScope, name: "Team", slug: "Our Team" });

        expect(isError).toBe(true);
        expect(text).toContain('"path": "slug"');
        expect(pageTreeService.createNode).not.toHaveBeenCalled();
    });

    it("refuses to create a node with a slug that isn't available", async () => {
        pageTreeService.getSlugAvailability.mockResolvedValueOnce(PageTreeSlugAvailability.Reserved);
        const { text, isError } = await callTool("create_page_tree_node", { scope: allowedScope, name: "Events", slug: "events" });

        expect(isError).toBe(true);
        expect(text).toContain('The slug "events" is reserved.');
        expect(pageTreeService.createNode).not.toHaveBeenCalled();
    });

    it("creates a node with the document type it is asked for", async () => {
        const { text, isError } = await callTool("create_page_tree_node", { scope: allowedScope, name: "New", slug: "new" });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ id: newNode.id, path: "/new" });
        expect(pageTreeService.createNode).toHaveBeenCalledWith(
            expect.objectContaining({ name: "New", slug: "new", userGroup: "all", attachedDocument: expect.objectContaining({ type: "Page" }) }),
            "mainNavigation",
            allowedScope,
        );
        expect(buildsService.setChangesSinceLastBuild).toHaveBeenCalledWith(allowedScope);
    });

    it.each(["update_page_tree_node", "update_page_tree_node_visibility", "delete_page_tree_node"])(
        "answers %s for a node of a scope the user may not change as if it didn't exist",
        async (tool) => {
            const { text, isError } = await callTool(tool, { id: otherScopeNode.id, visibility: "Unpublished" });

            expect(isError).toBe(true);
            expect(text).toBe(`There is no page tree node ${otherScopeNode.id}.`);
        },
    );

    it("refuses to update an archived node", async () => {
        const { text, isError } = await callTool("update_page_tree_node", { id: archivedNode.id, name: "Older" });

        expect(isError).toBe(true);
        expect(text).toContain("is archived and can't be changed");
        expect(pageTreeService.updateNode).not.toHaveBeenCalled();
    });

    it("keeps the fields of a node that an update leaves out", async () => {
        const { isError } = await callTool("update_page_tree_node", { id: aboutNode.id, name: "About us" });

        expect(isError).toBe(false);
        expect(pageTreeService.updateNode).toHaveBeenCalledWith(
            aboutNode.id,
            expect.objectContaining({ name: "About us", slug: "about", createAutomaticRedirectsOnSlugChange: true }),
        );
    });

    it("restores an archived node", async () => {
        const { isError } = await callTool("update_page_tree_node_visibility", { id: archivedNode.id, visibility: "Unpublished" });

        expect(isError).toBe(false);
        expect(pageTreeService.updateNodeVisibility).toHaveBeenCalledWith(archivedNode.id, "Unpublished");
    });

    it("refuses to delete the node home", async () => {
        const { text, isError } = await callTool("delete_page_tree_node", { id: homeNode.id });

        expect(isError).toBe(true);
        expect(text).toBe('The page tree node "home" can\'t be deleted.');
        expect(pageTreeService.delete).not.toHaveBeenCalled();
    });
});

describe("save_page", () => {
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

        const read = await callTool("get_page_input", { pageTreeNodeId: aboutNode.id });
        expect(read.isError).toBe(false);
        const page = JSON.parse(read.text);
        expect(page).toMatchObject({ id: aboutPageId, updatedAt: "2026-11-16T10:00:00.000Z", seo: { openGraphImage } });

        const saved = await callTool("save_page", {
            pageTreeNodeId: aboutNode.id,
            lastUpdatedAt: page.updatedAt,
            content: page.content,
            stage: page.stage,
            seo: page.seo,
        });
        expect(saved).toMatchObject({ isError: false });
    });

    it("answers get_page_input for a node without a saved page with how to create one", async () => {
        const { text, isError } = await callTool("get_page_input", { pageTreeNodeId: newNode.id });

        expect(isError).toBe(true);
        expect(text).toContain('passing null as "lastUpdatedAt"');
    });

    it("saves the page of the node and answers with its new updatedAt for the next save", async () => {
        const first = await callTool("save_page", { pageTreeNodeId: aboutNode.id, lastUpdatedAt: "2026-11-16T10:00:00.000Z", ...validPage });

        expect(first.isError).toBe(false);
        expect(JSON.parse(first.text)).toEqual({ id: aboutPageId, pageTreeNodeId: aboutNode.id, updatedAt: "2026-11-16T12:00:00.000Z" });
        expect(pagesService.savePage).toHaveBeenCalledWith(expect.objectContaining({ pageId: aboutPageId, attachedPageTreeNodeId: aboutNode.id }));
        const [{ input }] = pagesService.savePage.mock.calls[0] as unknown as [{ input: { content: { transformToBlockData: () => unknown } } }];
        expect(input.content.transformToBlockData()).toEqual({ blocks: [] });

        const second = await callTool("save_page", { pageTreeNodeId: aboutNode.id, lastUpdatedAt: JSON.parse(first.text).updatedAt, ...validPage });
        expect(second.isError).toBe(false);
    });

    it("refuses to overwrite a page that was changed since the agent read it", async () => {
        const { text, isError } = await callTool("save_page", {
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
        const { text, isError } = await callTool("save_page", { pageTreeNodeId: aboutNode.id, lastUpdatedAt: null, ...validPage });

        expect(isError).toBe(true);
        expect(text).toContain("already has a saved page");
    });

    it("creates the page of a node that has none yet", async () => {
        const { isError } = await callTool("save_page", { pageTreeNodeId: newNode.id, lastUpdatedAt: null, ...validPage });

        expect(isError).toBe(false);
        expect(pagesService.savePage).toHaveBeenCalledWith(expect.objectContaining({ attachedPageTreeNodeId: newNode.id, lastUpdatedAt: undefined }));
        expect(pagesService.savePage.mock.calls[0][0].pageId).not.toBe(aboutPageId);
        expect(buildsService.setChangesSinceLastBuild).toHaveBeenCalledWith(allowedScope);
    });

    it("refuses to save the page of an archived node", async () => {
        const { text, isError } = await callTool("save_page", { pageTreeNodeId: archivedNode.id, lastUpdatedAt: null, ...validPage });

        expect(isError).toBe(true);
        expect(text).toContain("is archived and can't be changed");
    });

    it("answers the page of a node of a scope the user may not change as if it didn't exist", async () => {
        const { text, isError } = await callTool("save_page", { pageTreeNodeId: otherScopeNode.id, lastUpdatedAt: null, ...validPage });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page tree node ${otherScopeNode.id}.`);
    });

    it("reports an invalid block with the path of the invalid value", async () => {
        const { text, isError } = await callTool("save_page", {
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
