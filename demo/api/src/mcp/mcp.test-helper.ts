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
    PageTreeService,
    type RequestContextInterface,
    UserPermissionsModule,
} from "@dextinity/cms-api";
import { EntityManager, MikroORM, NotFoundError } from "@mikro-orm/postgresql";
import type { Client } from "@modelcontextprotocol/client";
import { type CanActivate, type ExecutionContext, type INestApplication, Inject, Injectable, Module, type Provider, Scope } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { CONTEXT } from "@nestjs/graphql";
import { connectMcpClient } from "@nestjs/mcp/testing";
import { Test } from "@nestjs/testing";
import { DamFile } from "@src/dam/entities/dam-file.entity.js";
import { Page } from "@src/documents/pages/entities/page.entity.js";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity.js";
import type { Request } from "express";

import { AiModeMcpModule } from "./mcp.module.js";

// The app of the specs covers what a direct call to a tool method doesn't go through: the user the authentication puts
// on the request, the permission checks of `UserPermissionsGuard` that the tools declare, the answers to a refused call,
// and the request-scoped service the tools resolve per call.

export const allowedScope = { domain: "main", language: "en" };

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

export const transformedBlocks: { blockContext: unknown; requestContext: RequestContextInterface | undefined }[] = [];

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

export function createBlockData() {
    return { transformToPlain: () => RequestScopedBlockTransformerService, transformToSave: () => ({}) };
}

type SamplePageTreeNode = { id: string; slug: string; scope: ContentScope };
type SamplePage = { id: string; node: SamplePageTreeNode };
type SampleDamFile = { id: string; scope: { domain: string } };

type McpTestAppOptions = {
    pageTreeNodes?: SamplePageTreeNode[];
    pages?: SamplePage[];
    damFiles?: SampleDamFile[];
    getPageTreeNodes?: () => Promise<SamplePageTreeNode[]>;
    findDamFiles?: () => Promise<[SampleDamFile[], number]>;
};

const accessControlService = {
    isAllowed: (user: CurrentUser, permission: string, scope?: ContentScope) =>
        permission === "aiHub"
            ? user.id !== "editorWithoutAiHub"
            : ["pageTree", CorePermission.dam].includes(permission) &&
              Object.entries(scope ?? {}).every(([dimension, value]) => value === (allowedScope as Record<string, string>)[dimension]),
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

function createAppProviders({
    pageTreeNodes = [],
    pages = [],
    damFiles = [],
    getPageTreeNodes = async () => [],
    findDamFiles = async () => [[], 0],
}: McpTestAppOptions): Provider[] {
    const readApi = {
        preloadNodes: async () => undefined,
        getNodes: getPageTreeNodes,
        getNodesCount: async () => 1,
        getNode: async (id: string) => pageTreeNodes.find((node) => node.id === id) ?? null,
        getNodeByPath: async (path: string, { scope }: { scope: unknown }) =>
            pageTreeNodes.find((node) => `/${node.slug}` === path && node.scope === scope) ?? null,
        getFirstNodeByAttachedPageId: async (pageId: string) => pages.find((page) => page.id === pageId)?.node ?? null,
        nodePath: async (node: { slug: string }) => `/${node.slug}`,
        parentNodes: async () => [],
        getChildNodes: async () => [],
    };

    // The rows `@AffectedEntity` reads the scope of.
    const rowsByEntity = new Map<unknown, { id: string }[]>([
        [PageTreeNode, pageTreeNodes],
        [Page, pages],
        [DamFile, damFiles],
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

    return [
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
            useValue: { findAndCount: findDamFiles, findOneById: async (id: string) => damFiles.find((file) => file.id === id) ?? null },
        },
    ];
}

// The services the tools get from the app's modules.
@Module({})
class AppServicesModule {}

export const adminUrl = "https://admin.example.com";

export async function createMcpTestApp(options: McpTestAppOptions = {}) {
    const appProviders = createAppProviders(options);
    const moduleRef = await Test.createTestingModule({
        imports: [{ module: AppServicesModule, global: true, providers: appProviders, exports: appProviders }, AiModeMcpModule.forRoot({ adminUrl })],
        providers: [{ provide: APP_GUARD, useClass: HeaderAuthGuard }, userPermissionsGuardProvider],
    }).compile();
    const app: INestApplication = moduleRef.createNestApplication();
    // As main.ts sets them up. The global filter also catches the exceptions of tool calls that no filter of the tool catches.
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new ExceptionFilter(false));
    await app.listen(0);
    const clients: Record<string, Client> = {};

    return {
        endpoint: `${await app.getUrl()}/api/mcp`.replace("[::1]", "127.0.0.1"),
        async callTool(name: string, args: Record<string, unknown>, user = "editor") {
            clients[user] ??= await connectMcpClient(app, { headers: { "x-test-user": user } });
            const result = await clients[user].callTool({ name, arguments: args });
            const [content] = result.content as { type: "text"; text: string }[];
            return { text: content.text, isError: result.isError === true };
        },
        async close() {
            await Promise.all(Object.values(clients).map((client) => client.close()));
            await app.close();
        },
    };
}
