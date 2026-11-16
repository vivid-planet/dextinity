import { createMock } from "@golevelup/ts-vitest";
import { type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CurrentUser } from "../../user-permissions/dto/current-user.js";
import type { User } from "../../user-permissions/interfaces/user.js";
import type { UserPermissionsService } from "../../user-permissions/user-permissions.service.js";
import { DISABLE_DEXTINITY_GUARDS_METADATA_KEY } from "../decorators/disable-dextinity-guards.decorator.js";
import { type AuthServiceInterface, SKIP_AUTH_SERVICE } from "../util/auth-service.interface.js";
import { DextinityAuthGuard } from "./dextinity.guard.js";

const user: User = { id: "1", name: "Admin", email: "demo@dextinity.com" };
const currentUser: CurrentUser = { ...user, permissions: [] };

const mockHttpContext = (request: Partial<Request>) =>
    createMock<ExecutionContext>({
        getType: () => "http",
        switchToHttp: () => ({ getRequest: () => request }),
    });

const mockMcpContext = (request: Partial<Request> | undefined) => {
    const args = [{ id: "input" }, { kind: "tool", name: "test", transport: request ? "http" : "stdio", request }];
    return createMock<ExecutionContext>({
        getType: () => "mcp",
        getArgs: () => args,
        getArgByIndex: (index: number) => args[index],
        switchToHttp: () => {
            throw new Error("An MCP call has no HTTP context");
        },
    });
};

describe("DextinityAuthGuard", () => {
    let reflector: Reflector;
    let authService: AuthServiceInterface;
    let guard: DextinityAuthGuard;

    beforeEach(() => {
        reflector = new Reflector();
        reflector.getAllAndOverride = vi.fn().mockReturnValue(undefined);
        authService = { authenticateUser: vi.fn().mockResolvedValue({ user }) };
        const userPermissionsService = createMock<UserPermissionsService>({
            createCurrentUser: vi.fn().mockResolvedValue(currentUser),
        });
        guard = new DextinityAuthGuard(reflector, userPermissionsService, [authService]);
    });

    it("sets the authenticated user on the request of an HTTP request", async () => {
        const request: Partial<Request> & { user?: unknown } = { headers: {} };
        expect(await guard.canActivate(mockHttpContext(request))).toBe(true);
        expect(authService.authenticateUser).toHaveBeenCalledWith(request);
        expect(request.user).toBe(currentUser);
    });

    it("sets the authenticated user on the HTTP request of an MCP call", async () => {
        const request: Partial<Request> & { user?: unknown } = { headers: {} };
        expect(await guard.canActivate(mockMcpContext(request))).toBe(true);
        expect(authService.authenticateUser).toHaveBeenCalledWith(request);
        expect(request.user).toBe(currentUser);
    });

    it("denies an MCP call no auth service can authenticate", async () => {
        authService.authenticateUser = vi.fn().mockResolvedValue(SKIP_AUTH_SERVICE);
        await expect(guard.canActivate(mockMcpContext({ headers: {} }))).rejects.toThrow(UnauthorizedException);
    });

    it("denies an MCP call without an HTTP request", async () => {
        await expect(guard.canActivate(mockMcpContext(undefined))).rejects.toThrow(UnauthorizedException);
        expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it("allows an MCP call without an HTTP request to a handler with disabled guards", async () => {
        reflector.getAllAndOverride = vi.fn().mockImplementation((key: string) => key === DISABLE_DEXTINITY_GUARDS_METADATA_KEY);
        expect(await guard.canActivate(mockMcpContext(undefined))).toBe(true);
    });
});
