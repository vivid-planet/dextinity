import {
    BlocksTransformerService,
    type ContentScope,
    CorePermission,
    type CurrentUser,
    ExceptionFilter,
    FilesService,
    getRequestContextHeadersFromRequest,
    getRequestFromExecutionContext,
    PageTreeNodeDocumentEntityScopeService,
    PageTreeNodeVisibility,
    PageTreeService,
    type RequestContextInterface,
    UserPermissionsModule,
} from "@dextinity/cms-api";
import { EntityManager, MikroORM, NotFoundError } from "@mikro-orm/postgresql";
import type { Client } from "@modelcontextprotocol/client";
import {
    type CanActivate,
    type ExecutionContext,
    Global,
    type INestApplication,
    Inject,
    Injectable,
    Module,
    type Provider,
    Scope,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CONTEXT } from "@nestjs/graphql";
import { connectMcpClient } from "@nestjs/mcp/testing";
import { Test } from "@nestjs/testing";
import { DamFile } from "@src/dam/entities/dam-file.entity.js";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import type { Request } from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AiModeMcpModule } from "./mcp.module.js";

// Covers what a direct call to a tool method doesn't go through: the user the authentication puts on the request, the
// permission checks of `UserPermissionsGuard` that the tools declare, the answers to a refused call, and the
// request-scoped service the tools resolve per call.

const allowedScope = { domain: "main", language: "en" };
const otherScope = { domain: "secondary", language: "en" };

const users: Record<string, CurrentUser | string> = {
    editor: { id: "editor", name: "Editor" } as CurrentUser,
    editorWithoutAiHub: { id: "editorWithoutAiHub", name: "Editor without AI Hub" } as CurrentUser,
    system: "system-user",
};

// Stands in for DextinityAuthGuard: authenticates the request as the user its header names.
@Injectable()
class HeaderAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = getRequestFromExecutionContext(context);
        const userName = request?.headers["x-test-user"];
        if (!request || typeof userName !== "string") {
            return false;
        }
        request.user = users[userName];
        return request.user !== undefined;
    }
}

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

function createBlockData() {
    return { transformToPlain: () => RequestScopedBlockTransformerService, transformToSave: () => ({}) };
}

const homeNode = { id: "0190a5f4-0000-7000-8000-000000000001", name: "Home", slug: "home", documentType: "Page", scope: allowedScope };
const otherScopeNode = { id: "0190a5f4-0000-7000-8000-000000000002", name: "Other", slug: "other", documentType: "Page", scope: otherScope };
const nodes = [homeNode, otherScopeNode];
const pages = [
    { id: "0190a5f4-0000-7000-8000-000000000011", node: homeNode, content: createBlockData(), stage: createBlockData(), seo: createBlockData() },
    {
        id: "0190a5f4-0000-7000-8000-000000000012",
        node: otherScopeNode,
        content: createBlockData(),
        stage: createBlockData(),
        seo: createBlockData(),
    },
];
const damFile = { id: "0190a5f4-0000-7000-8000-000000000021", name: "spring.jpg", scope: { domain: "secondary" } };
const unknownId = "0190a5f4-0000-7000-8000-000000000099";
const findDamFiles = vi.fn(async () => [[], 0]);
const getNodes = vi.fn(async () => [homeNode]);

const readApi = {
    preloadNodes: async () => undefined,
    getNodes,
    getNodesCount: async () => 1,
    getNode: async (id: string) => nodes.find((node) => node.id === id) ?? null,
    getNodeByPath: async (path: string, { scope }: { scope: unknown }) =>
        nodes.find((node) => `/${node.slug}` === path && node.scope === scope) ?? null,
    getFirstNodeByAttachedPageId: async (pageId: string) => pages.find((page) => page.id === pageId)?.node ?? null,
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
    parentNodes: async () => [],
    getChildNodes: async () => [],
};

const accessControlService = {
    isAllowed: (user: CurrentUser, permission: string, scope?: ContentScope) =>
        permission === "aiHub"
            ? user.id !== "editorWithoutAiHub"
            : ["pageTree", CorePermission.dam].includes(permission) &&
              Object.entries(scope ?? {}).every(([dimension, value]) => value === (allowedScope as Record<string, string>)[dimension]),
};

// The rows `@AffectedEntity` reads the scope of.
const rowsByEntity = new Map<unknown, { id: string }[]>([
    [PageTreeNode, nodes],
    [Page, pages],
    [DamFile, [damFile]],
]);

const orm = {
    em: {
        findOneOrFail: async (entity: { name: string }, id: string) => {
            const row = rowsByEntity.get(entity)?.find((candidate) => candidate.id === id);
            if (!row) {
                throw NotFoundError.findOneFailed(entity.name, { id });
            }
            return row;
        },
        getMetadata: () => ({ get: () => ({ getPrimaryProps: () => [{ type: "uuid" }] }) }),
    },
};

// The package exports neither the guard that `UserPermissionsModule` registers globally nor the service it checks the
// scopes with, so they are taken from the module's own providers.
const userPermissionsProviders: Provider[] = Reflect.getMetadata("providers", UserPermissionsModule);

function findUserPermissionsProvider(isWanted: (provider: Provider) => boolean): Provider {
    const provider = userPermissionsProviders.find(isWanted);
    if (!provider) {
        throw new Error("UserPermissionsModule no longer provides what the test takes from it");
    }
    return provider;
}

const userPermissionsGuardProvider = findUserPermissionsProvider((provider) => typeof provider === "object" && provider.provide === APP_GUARD);
const contentScopeServiceProvider = findUserPermissionsProvider(
    (provider) => typeof provider === "function" && provider.name === "ContentScopeService",
);

const appProviders: Provider[] = [
    BlocksTransformerService,
    RequestScopedBlockTransformerService,
    PageTreeNodeDocumentEntityScopeService,
    contentScopeServiceProvider,
    { provide: "access-control-service", useValue: accessControlService },
    { provide: "user-permissions-options", useValue: { systemUsers: ["system-user"] } },
    { provide: MikroORM, useValue: orm },
    {
        provide: PageTreeService,
        useValue: {
            createReadApi: () => readApi,
            getActiveAttachedDocument: async (nodeId: string) => {
                const page = pages.find((candidate) => candidate.node.id === nodeId);
                return page ? { documentId: page.id } : null;
            },
        },
    },
    {
        provide: EntityManager,
        useValue: { findOne: async (_: unknown, id: string) => pages.find((page) => page.id === id) ?? null },
    },
    {
        provide: FilesService,
        useValue: { findAndCount: findDamFiles, findOneById: async (id: string) => (id === damFile.id ? damFile : null) },
    },
];

// The services the tools get from the app's modules.
@Global()
@Module({ providers: appProviders, exports: appProviders })
class AppServicesModule {}

const adminUrl = "https://admin.example.com";

let app: INestApplication;
let endpoint: string;
const clients: Record<string, Client> = {};

async function callTool(name: string, args: Record<string, unknown>, user = "editor") {
    clients[user] ??= await connectMcpClient(app, { headers: { "x-test-user": user } });
    const result = await clients[user].callTool({ name, arguments: args });
    const [content] = result.content as { type: "text"; text: string }[];
    return { text: content.text, isError: result.isError === true };
}

beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [AppServicesModule, AiModeMcpModule.forRoot({ adminUrl })],
        providers: [{ provide: APP_GUARD, useClass: HeaderAuthGuard }, userPermissionsGuardProvider],
    }).compile();

    app = moduleRef.createNestApplication();
    // As main.ts sets them up. The global filter also catches the exceptions of tool calls that no filter of the tool catches.
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new ExceptionFilter(false));
    await app.listen(0);
    endpoint = `${await app.getUrl()}/api/mcp`.replace("[::1]", "127.0.0.1");
});

beforeEach(() => {
    transformedBlocks.length = 0;
});

afterAll(async () => {
    await Promise.all(Object.values(clients).map((client) => client.close()));
    await app?.close();
});

describe("MCP server of the API", () => {
    it("answers get_page with the blocks transformed as the admin's editor sees them", async () => {
        const { text, isError } = await callTool("get_page", { id: pages[0].id });

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
    ])("answers a page %s as if it didn't exist", async (_, id) => {
        const { text, isError } = await callTool("get_page", { id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page ${id}.`);
        expect(transformedBlocks).toEqual([]);
    });

    it("answers get_page_tree_node with the ID of the attached document", async () => {
        const { text, isError } = await callTool("get_page_tree_node", { id: homeNode.id });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ id: homeNode.id, path: "/home", documentId: pages[0].id, scope: allowedScope });
    });

    it.each([
        ["of a scope the user may not read", otherScopeNode.id],
        ["that doesn't exist", unknownId],
    ])("answers a page tree node %s as if it didn't exist", async (_, id) => {
        const { text, isError } = await callTool("get_page_tree_node", { id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page tree node ${id}.`);
    });

    it("lists the page tree nodes of a scope the user may read", async () => {
        const { text, isError } = await callTool("list_page_tree_nodes", { scope: allowedScope, category: "mainNavigation" });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ nodes: [{ id: homeNode.id, path: "/home" }], totalCount: 1 });
        expect(getNodes).toHaveBeenCalledWith(expect.objectContaining({ scope: allowedScope, category: "mainNavigation", limit: 100, offset: 0 }));
    });

    it.each([
        ["list_page_tree_nodes", { scope: otherScope }],
        ["get_page_tree_node_by_path", { scope: otherScope, path: "/other" }],
    ])("refuses %s in a scope the user may not read", async (tool, args) => {
        const { text, isError } = await callTool(tool, args);

        expect(isError).toBe(true);
        expect(text).toBe("You may not read the page tree of this scope.");
    });

    it("refuses to list the DAM files of a scope the user may not read", async () => {
        const { text, isError } = await callTool("list_dam_files", { scope: { domain: "secondary" } });

        expect(isError).toBe(true);
        expect(text).toBe("You may not read the DAM of this scope.");
    });

    it("sorts the DAM files ascending when only the column is named, as the damFilesList query does", async () => {
        const { isError } = await callTool("list_dam_files", { scope: { domain: "main" }, sortColumnName: "name" });

        expect(isError).toBe(false);
        expect(findDamFiles).toHaveBeenCalledWith(expect.objectContaining({ sortColumnName: "name", sortDirection: "ASC" }), { domain: "main" });
    });

    it("answers a DAM file of a scope the user may not read as if it didn't exist", async () => {
        const { text, isError } = await callTool("get_dam_file", { id: damFile.id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no DAM file ${damFile.id}.`);
    });

    it("refuses a system user, whom the permission check lets through", async () => {
        const { text, isError } = await callTool("get_page_tree_node", { id: homeNode.id }, "system");

        expect(isError).toBe(true);
        expect(text).toBe("The MCP server answers only a user signed in to the admin.");
    });

    it("lists the blocks of block-meta.json", async () => {
        const { text, isError } = await callTool("list_available_blocks", {});

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toContain("PageContent");
    });

    it("answers an unknown block name with the reason", async () => {
        const { text, isError } = await callTool("get_block_schema", { name: "Unknown" });

        expect(isError).toBe(true);
        expect(text).toBe('Unknown block "Unknown". Use the list_available_blocks tool to get the available block names.');
    });

    it("answers get_block_schema with the TipTap schema of a rich text block", async () => {
        const { text, isError } = await callTool("get_block_schema", { name: "richtext" });

        expect(isError).toBe(false);
        expect(text).toContain('"tipTap"');
    });
});

// The in-memory client skips the route, its guards, and the checks of the request's origin.
describe("HTTP endpoint of the MCP server", () => {
    async function listTools(headers: Record<string, string>) {
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json, text/event-stream",
                "mcp-protocol-version": "2025-11-25",
                "x-test-user": "editor",
                ...headers,
            },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
        });
    }

    it("answers the chat in the admin", async () => {
        const response = await listTools({ origin: adminUrl });

        expect(response.status).toBe(200);
        expect(await response.text()).toContain('"name":"get_page"');
    });

    it("refuses a page of another site", async () => {
        const response = await listTools({ origin: "https://other.example.com" });

        expect(response.status).toBe(403);
    });

    it("refuses a user without the aiHub permission", async () => {
        const response = await listTools({ origin: adminUrl, "x-test-user": "editorWithoutAiHub" });

        expect(response.status).toBe(403);
    });
});
