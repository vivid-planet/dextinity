import { BlocksTransformerService, type ContentScope, CorePermission, type CurrentUser, FilesService, PageTreeService } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { type CanActivate, type ExecutionContext, type INestApplication, Inject, Injectable, Logger } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CONTEXT } from "@nestjs/graphql";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { AccessControlService } from "@src/auth/access-control.service.js";
import type { Request } from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { BlockTools } from "./block.tools.js";
import { DamTools } from "./dam.tools.js";
import { createMcpServer } from "./mcp.factory.js";
import { PageTreeTools } from "./page-tree.tools.js";

// Covers the wiring the tools depend on and a direct call to a tool method doesn't go through: the route, the
// user the authentication in front of it puts on the request, the permission checks the tools make in place of
// the resolvers' guards, and the request-scoped service they resolve per call.

const allowedScope = { domain: "main", language: "en" };
const otherScope = { domain: "secondary", language: "en" };

const users: Record<string, CurrentUser | string> = {
    editor: { id: "editor", name: "Editor" } as CurrentUser,
    system: "system-user",
};

// Stands in for DextinityAuthGuard: authenticates the request as the user its header names.
@Injectable()
class HeaderAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request & { user?: CurrentUser | string }>();
        request.user = users[request.header("x-test-user") ?? ""];
        return request.user !== undefined;
    }
}

const transformedBlocks: { block: unknown; context: unknown }[] = [];

// Request-scoped like the real one, which reads its block context off the GraphQL request.
@Injectable()
class RequestScopedBlocksTransformerService {
    constructor(@Inject(CONTEXT) context: { req: Request }) {
        expect(context.req.headers).toEqual({});
    }

    async transformToPlain(block: unknown, context: unknown) {
        transformedBlocks.push({ block, context });
        return { transformed: block };
    }
}

const homeNode = { id: "0190a5f4-0000-7000-8000-000000000001", name: "Home", slug: "home", documentType: "Page", scope: allowedScope };
const otherScopeNode = { id: "0190a5f4-0000-7000-8000-000000000002", name: "Other", slug: "other", documentType: "Page", scope: otherScope };
const nodes = [homeNode, otherScopeNode];
const pages = [
    { id: "0190a5f4-0000-7000-8000-000000000011", node: homeNode, content: "content", stage: "stage", seo: "seo" },
    { id: "0190a5f4-0000-7000-8000-000000000012", node: otherScopeNode, content: "content", stage: "stage", seo: "seo" },
];
const damFile = { id: "0190a5f4-0000-7000-8000-000000000021", name: "spring.jpg", scope: { domain: "secondary" } };
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
    isAllowed: (user: CurrentUser, permission: string, scope: ContentScope) =>
        ["pageTree", CorePermission.dam].includes(permission) &&
        Object.entries(scope).every(([dimension, value]) => value === (allowedScope as Record<string, string>)[dimension]),
};

let app: INestApplication;
let endpoint: string;

async function callTool(name: string, args: Record<string, unknown>, user = "editor") {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "x-test-user": user },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    });
    const { result } = (await response.json()) as { result: { content: { text: string }[]; isError?: boolean } };
    return { text: result.content[0].text, isError: result.isError === true };
}

beforeAll(async () => {
    const mcp = createMcpServer();
    const moduleRef = await Test.createTestingModule({
        controllers: [mcp.controller, BlockTools, DamTools, PageTreeTools],
        providers: [
            { provide: APP_GUARD, useClass: HeaderAuthGuard },
            { provide: AccessControlService, useValue: accessControlService },
            { provide: BlocksTransformerService, useClass: RequestScopedBlocksTransformerService },
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
        ],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    mcp.strategy.setHttpAdapter(app.getHttpAdapter());
    app.connectMicroservice({ strategy: mcp.strategy });
    await app.startAllMicroservices();
    await app.listen(0);
    endpoint = `${await app.getUrl()}/mcp`.replace("[::1]", "127.0.0.1");
});

beforeEach(() => {
    transformedBlocks.length = 0;
    vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
});

afterAll(async () => {
    await app?.close();
});

describe("MCP endpoint of the API", () => {
    it("answers get_page with the blocks transformed as the admin's editor sees them", async () => {
        const { text, isError } = await callTool("get_page", { id: pages[0].id });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({
            id: pages[0].id,
            pageTreeNode: { id: homeNode.id, path: "/home" },
            content: { transformed: "content" },
            stage: { transformed: "stage" },
            seo: { transformed: "seo" },
        });
        expect(transformedBlocks.map(({ context }) => context)).toEqual(Array(3).fill({ includeInvisibleContent: true, previewDamUrls: true }));
    });

    it("answers a page of a scope the user may not read as if it didn't exist", async () => {
        const { text, isError } = await callTool("get_page", { id: pages[1].id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page ${pages[1].id}.`);
        expect(transformedBlocks).toEqual([]);
    });

    it("answers get_page_tree_node with the ID of the attached document", async () => {
        const { text, isError } = await callTool("get_page_tree_node", { id: homeNode.id });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ id: homeNode.id, path: "/home", documentId: pages[0].id, scope: allowedScope });
    });

    it("answers a page tree node of a scope the user may not read as if it didn't exist", async () => {
        const { text, isError } = await callTool("get_page_tree_node", { id: otherScopeNode.id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page tree node ${otherScopeNode.id}.`);
    });

    it("lists the page tree nodes of a scope the user may read", async () => {
        const { text, isError } = await callTool("list_page_tree_nodes", { scope: allowedScope, category: "mainNavigation" });

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toMatchObject({ nodes: [{ id: homeNode.id, path: "/home" }], totalCount: 1 });
        expect(getNodes).toHaveBeenCalledWith(expect.objectContaining({ scope: allowedScope, category: "mainNavigation", limit: 100, offset: 0 }));
    });

    it.each(["list_page_tree_nodes", "get_page_tree_node_by_path"])("refuses %s in a scope the user may not read", async (tool) => {
        const { text, isError } = await callTool(tool, { scope: otherScope, path: "/other" });

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

    it("refuses a system user", async () => {
        const { text, isError } = await callTool("list_available_blocks", {}, "system");

        expect(isError).toBe(true);
        expect(text).toBe("The MCP server answers only a user signed in to the admin.");
    });

    it("lists the blocks of block-meta.json", async () => {
        const { text, isError } = await callTool("list_available_blocks", {});

        expect(isError).toBe(false);
        expect(JSON.parse(text)).toContain("PageContent");
    });

    it("answers get_block_schema with the TipTap schema of a rich text block", async () => {
        const { text, isError } = await callTool("get_block_schema", { name: "richtext" });

        expect(isError).toBe(false);
        expect(text).toContain('"tipTap"');
    });
});
