import { fileURLToPath } from "node:url";

import {
    AiModeMcpModule,
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
    Logger,
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

import { damScopeSchema, pageTreeCategorySchema, pageTreeScopeSchema } from "./mcp.schemas.js";
import { PageTools } from "./page.tools.js";

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

const readApi = {
    getFirstNodeByAttachedPageId: async (pageId: string) => pages.find((page) => page.id === pageId)?.node ?? null,
    nodePath: async (node: { slug: string }) => `/${node.slug}`,
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
    DeletedLinkTargetBlockTransformerService,
    PageTreeNodeDocumentEntityScopeService,
    contentScopeServiceProvider,
    { provide: "access-control-service", useValue: accessControlService },
    { provide: "user-permissions-options", useValue: { systemUsers: ["system-user"] } },
    { provide: MikroORM, useValue: orm },
    {
        provide: PageTreeService,
        useValue: {
            createReadApi: () => readApi,
        },
    },
    {
        provide: EntityManager,
        useValue: { findOne: async (_: unknown, id: string) => pages.find((page) => page.id === id) ?? null },
    },
    // The DAM tools of the module aren't called here.
    { provide: FilesService, useValue: {} },
];

// The services the tools get from the app's modules.
@Global()
@Module({ providers: appProviders, exports: appProviders })
class AppServicesModule {}

let app: INestApplication;
const clients: Record<string, Client> = {};

async function callTool(name: string, args: Record<string, unknown>, user = "editor") {
    clients[user] ??= await connectMcpClient(app, { headers: { "x-test-user": user } });
    const result = await clients[user].callTool({ name, arguments: args });
    const [content] = result.content as { type: "text"; text: string }[];
    return { text: content.text, isError: result.isError === true };
}

beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [
            AppServicesModule,
            AiModeMcpModule.forRoot({
                adminUrl: "https://admin.example.com",
                blockMetaPath: fileURLToPath(new URL("../../block-meta.json", import.meta.url)),
                dam: { File: DamFile, scopeSchema: damScopeSchema },
                pageTree: { PageTreeNode, scopeSchema: pageTreeScopeSchema, categorySchema: pageTreeCategorySchema },
                tools: [PageTools],
            }),
        ],
        providers: [{ provide: APP_GUARD, useClass: HeaderAuthGuard }, userPermissionsGuardProvider],
    }).compile();

    app = moduleRef.createNestApplication();
    // As main.ts sets them up. The global filter also catches the exceptions of tool calls that no filter of the tool catches.
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new ExceptionFilter(false));
    await app.init();
});

beforeEach(() => {
    transformedBlocks.length = 0;
});

afterAll(async () => {
    await Promise.all(Object.values(clients).map((client) => client.close()));
    await app?.close();
});

describe("get_page", () => {
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
        ["that isn't attached to a page tree node", pages[2].id],
    ])("answers a page %s as if it didn't exist", async (_, id) => {
        const { text, isError } = await callTool("get_page", { id });

        expect(isError).toBe(true);
        expect(text).toBe(`There is no page ${id}.`);
        expect(transformedBlocks).toEqual([]);
    });

    it("doesn't answer a page whose link target is missing as if the page didn't exist", async () => {
        const logError = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

        const { text, isError } = await callTool("get_page", { id: pages[3].id });

        expect(isError).toBe(true);
        expect(text).toBe("Internal server error");
        expect(logError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining(deletedNewsId) }));
        logError.mockRestore();
    });
});
