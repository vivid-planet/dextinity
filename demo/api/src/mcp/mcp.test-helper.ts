import {
    BlocksTransformerService,
    type ContentScope,
    CorePermission,
    type CurrentUser,
    ExceptionFilter,
    FilesService,
    getRequestFromExecutionContext,
    PageTreeNodeDocumentEntityScopeService,
    PageTreeService,
    UserPermissionsModule,
} from "@dextinity/cms-api";
import { EntityManager, MikroORM, NotFoundError } from "@mikro-orm/postgresql";
import type { Client } from "@modelcontextprotocol/client";
import { type CanActivate, type ExecutionContext, type INestApplication, Injectable, Module, type Provider } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { connectMcpClient } from "@nestjs/mcp/testing";
import { Test } from "@nestjs/testing";

import { AiModeMcpModule } from "./mcp.module.js";

// The app of the specs covers what a direct call to a tool method doesn't go through: the user the authentication puts
// on the request, the permission checks of `UserPermissionsGuard` that the tools declare, and the answers to a refused
// call.

export const allowedScope = { domain: "main", language: "en" };

export const adminUrl = "https://admin.example.com";

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

const permissionProviders: Provider[] = [
    PageTreeNodeDocumentEntityScopeService,
    contentScopeServiceProvider,
    { provide: "access-control-service", useValue: accessControlService },
    { provide: "user-permissions-options", useValue: { systemUsers: ["system-user"] } },
];

// Nest resolves the services of all tools of the module, also of those a spec doesn't call.
const serviceStubs: Provider[] = [BlocksTransformerService, PageTreeService, EntityManager, FilesService, MikroORM].map((token) => ({
    provide: token,
    useValue: {},
}));

function getToken(provider: Provider): unknown {
    return typeof provider === "function" ? provider : provider.provide;
}

/** The ORM `@AffectedEntity` finds the entity it reads the scope of with. */
export function createOrmProvider(rowsByEntity: Map<unknown, { id: string }[]>): Provider {
    return {
        provide: MikroORM,
        useValue: {
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
        },
    };
}

// The services the tools get from the app's modules.
@Module({})
class AppServicesModule {}

/** Builds the app with the services the spec provides for the tools it calls. */
export async function createMcpTestApp(providers: Provider[] = []) {
    const providedTokens = new Set(providers.map(getToken));
    const appProviders = [...permissionProviders, ...serviceStubs.filter((stub) => !providedTokens.has(getToken(stub))), ...providers];

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
