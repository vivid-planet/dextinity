import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { MikroORM, NotFoundError } from "@mikro-orm/postgresql";
import type { Client } from "@modelcontextprotocol/client";
import { type CanActivate, type ExecutionContext, Global, type INestApplication, Injectable, Module, type Provider, type Type } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { connectMcpClient } from "@nestjs/mcp/testing";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { getRequestFromExecutionContext } from "../common/decorators/utils.js";
import { CorePermission } from "../common/enum/core-permission.enum.js";
import { ExceptionFilter } from "../common/errors/exception.filter.js";
import type { FileInterface } from "../dam/files/entities/file.entity.js";
import { FilesService } from "../dam/files/files.service.js";
import { PageTreeService } from "../page-tree/page-tree.service.js";
import type { PageTreeNodeInterface } from "../page-tree/types.js";
import { UserPermissionsGuard } from "../user-permissions/auth/user-permissions.guard.js";
import { ContentScopeService } from "../user-permissions/content-scope.service.js";
import type { CurrentUser } from "../user-permissions/dto/current-user.js";
import { ACCESS_CONTROL_SERVICE, USER_PERMISSIONS_OPTIONS } from "../user-permissions/user-permissions.constants.js";
import { AiModeMcpModule } from "./ai-mode-mcp.module.js";

// Covers what a direct call to a tool method doesn't go through: the user the authentication puts on the request, the
// permission checks of `UserPermissionsGuard` that the tools declare, and the answers to a refused call.

const allowedScope = { domain: "main" };
const otherScope = { domain: "secondary" };

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

// Only the classes matter, as the entities `@AffectedEntity` reads the scope of.
class TestDamFile {}
class TestPageTreeNode {}

const homeNode = {
    id: "0190a5f4-0000-7000-8000-000000000001",
    name: "Home",
    slug: "home",
    documentType: "Page",
    category: "mainNavigation",
    scope: allowedScope,
    userGroup: "all",
};
const otherScopeNode = { id: "0190a5f4-0000-7000-8000-000000000002", name: "Other", slug: "other", documentType: "Page", scope: otherScope };
const nodes = [homeNode, otherScopeNode];
const homePageId = "0190a5f4-0000-7000-8000-000000000011";
const unknownId = "0190a5f4-0000-7000-8000-000000000099";
const getNodes = vi.fn(async () => [homeNode]);

const readApi = {
    preloadNodes: async () => undefined,
    getNodes,
    getNodesCount: async () => 1,
    getNode: async (id: string) => nodes.find((node) => node.id === id) ?? null,
    getNodeByPath: async (path: string, { scope }: { scope: unknown }) =>
        nodes.find((node) => `/${node.slug}` === path && node.scope === scope) ?? null,
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
    parentNodes: async () => [],
    getChildNodes: async () => [],
};

const damFile = { id: "0190a5f4-0000-7000-8000-000000000021", name: "spring.jpg", scope: { domain: "secondary" } };
const findDamFiles = vi.fn(async () => [[], 0]);

const accessControlService = {
    isAllowed: (user: CurrentUser, permission: string, scope?: Record<string, string>) =>
        permission === CorePermission.aiHub
            ? user.id !== "editorWithoutAiHub"
            : [CorePermission.pageTree, CorePermission.dam].includes(permission as CorePermission) &&
              Object.entries(scope ?? {}).every(([dimension, value]) => value === (allowedScope as Record<string, string>)[dimension]),
};

// The rows `@AffectedEntity` reads the scope of.
const rowsByEntity = new Map<unknown, { id: string }[]>([
    [TestPageTreeNode, nodes],
    [TestDamFile, [damFile]],
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

const appProviders: Provider[] = [
    ContentScopeService,
    { provide: ACCESS_CONTROL_SERVICE, useValue: accessControlService },
    { provide: USER_PERMISSIONS_OPTIONS, useValue: { systemUsers: ["system-user"] } },
    { provide: MikroORM, useValue: orm },
    {
        provide: FilesService,
        useValue: {
            findAndCount: findDamFiles,
            findOneById: async (id: string) => (id === damFile.id ? damFile : null),
            createFileUrl: async () => "https://dam.example.com/spring.jpg",
            getDamPath: async () => "/",
        },
    },
    {
        provide: PageTreeService,
        useValue: {
            createReadApi: () => readApi,
            getActiveAttachedDocument: async (nodeId: string) => (nodeId === homeNode.id ? { documentId: homePageId } : null),
        },
    },
];

// The services the tools get from the app's modules.
@Global()
@Module({ providers: appProviders, exports: appProviders })
class AppServicesModule {}

const adminUrl = "https://admin.example.com";

const pageTree = {
    PageTreeNode: TestPageTreeNode as Type<PageTreeNodeInterface>,
    scopeSchema: z.strictObject({ domain: z.string() }),
    categorySchema: z.enum(["mainNavigation", "topMenu"]),
    additionalNodeFields: (node: PageTreeNodeInterface) => ({ userGroup: (node as PageTreeNodeInterface & { userGroup?: string }).userGroup }),
};

let blockMetaDirectory: string;
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
    blockMetaDirectory = await mkdtemp(join(tmpdir(), "ai-mode-mcp-"));
    const blockMetaPath = join(blockMetaDirectory, "block-meta.json");
    await writeFile(blockMetaPath, JSON.stringify([{ name: "PageContent" }, { name: "RichText", fields: [{ name: "tipTap" }] }]));

    const moduleRef = await Test.createTestingModule({
        imports: [
            AppServicesModule,
            AiModeMcpModule.forRoot({
                adminUrl,
                blockMetaPath,
                dam: { File: TestDamFile as Type<FileInterface>, scopeSchema: z.strictObject({ domain: z.string() }) },
                pageTree,
            }),
        ],
        providers: [
            { provide: APP_GUARD, useClass: HeaderAuthGuard },
            { provide: APP_GUARD, useClass: UserPermissionsGuard },
        ],
    }).compile();

    app = moduleRef.createNestApplication();
    // As an app's main.ts sets them up. The global filter also catches the exceptions of tool calls that no filter of the tool catches.
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new ExceptionFilter(false));
    await app.listen(0);
    endpoint = `${await app.getUrl()}/api/mcp`.replace("[::1]", "127.0.0.1");
});

afterAll(async () => {
    await Promise.all(Object.values(clients).map((client) => client.close()));
    await app?.close();
    await rm(blockMetaDirectory, { recursive: true, force: true });
});

describe("MCP server of the AI Mode", () => {
    it("answers get_page_tree_node with the ID of the attached document and the project's fields", async () => {
        const { text, isError } = await callTool("get_page_tree_node", { id: homeNode.id });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ id: homeNode.id, path: "/home", documentId: homePageId, scope: allowedScope, userGroup: "all" });
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
        expect(JSON.parse(text)).toMatchObject({ nodes: [{ id: homeNode.id, path: "/home", userGroup: "all" }], totalCount: 1 });
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
        const { isError } = await callTool("list_dam_files", { scope: allowedScope, sortColumnName: "name" });

        expect(isError).toBe(false);
        expect(findDamFiles).toHaveBeenCalledWith(expect.objectContaining({ sortColumnName: "name", sortDirection: "ASC" }), allowedScope);
    });

    it.each([
        ["of a scope the user may not read", damFile.id],
        ["that doesn't exist", unknownId],
    ])("answers a DAM file %s as if it didn't exist", async (_, id) => {
        const { text, isError } = await callTool("get_dam_file", { id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no DAM file ${id}.`);
    });

    it("refuses a system user, whom the permission check lets through", async () => {
        const { text, isError } = await callTool("list_available_blocks", {}, "system");

        expect(isError).toBe(true);
        expect(text).toBe("The MCP server answers only a user signed in to the admin.");
    });

    it("lists the blocks of the API's block-meta.json", async () => {
        const { text, isError } = await callTool("list_available_blocks", {});

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toEqual(["PageContent", "RichText"]);
    });

    it("answers an unknown block name with the reason", async () => {
        const { text, isError } = await callTool("get_block_schema", { name: "Unknown" });

        expect(isError).toBe(true);
        expect(text).toBe('Unknown block "Unknown". Use the list_available_blocks tool to get the available block names.');
    });

    it("finds a block's schema regardless of the case of its name", async () => {
        const { text, isError } = await callTool("get_block_schema", { name: "richtext" });

        expect(isError).toBe(false);
        expect(text).toContain('"tipTap"');
    });
});

// The in-memory client skips the route, its guards, and the checks of the request's origin.
describe("HTTP endpoint of the AI Mode's MCP server", () => {
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
        expect(await response.text()).toContain('"name":"get_dam_file"');
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

describe("MCP server of the AI Mode with a DAM without scope", () => {
    let unscopedApp: INestApplication;
    let client: Client;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                AppServicesModule,
                AiModeMcpModule.forRoot({
                    adminUrl,
                    blockMetaPath: join(blockMetaDirectory, "block-meta.json"),
                    dam: { File: TestDamFile as Type<FileInterface> },
                    pageTree,
                }),
            ],
            providers: [
                { provide: APP_GUARD, useClass: HeaderAuthGuard },
                { provide: APP_GUARD, useClass: UserPermissionsGuard },
            ],
        }).compile();

        unscopedApp = moduleRef.createNestApplication();
        await unscopedApp.init();
        client = await connectMcpClient(unscopedApp, { headers: { "x-test-user": "editor" } });
    });

    afterAll(async () => {
        await client?.close();
        await unscopedApp?.close();
    });

    it("lists the DAM files without a scope", async () => {
        findDamFiles.mockClear();

        const result = await client.callTool({ name: "list_dam_files", arguments: {} });

        expect(result.isError).toBeFalsy();
        expect(findDamFiles).toHaveBeenCalledWith(expect.objectContaining({ limit: 50, offset: 0 }), undefined);
    });

    it("doesn't ask the agent for a scope", async () => {
        const { tools } = await client.listTools();

        expect(tools.find((tool) => tool.name === "list_dam_files")?.inputSchema.properties).not.toHaveProperty("scope");
    });

    it("answers a DAM file", async () => {
        const result = await client.callTool({ name: "get_dam_file", arguments: { id: damFile.id } });
        const [content] = result.content as { type: "text"; text: string }[];

        expect(result.isError).toBeFalsy();
        expect(JSON.parse(content.text)).toMatchObject({ id: damFile.id, name: "spring.jpg" });
    });
});
