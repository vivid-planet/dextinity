import { createMock } from "@golevelup/ts-vitest";
import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CurrentUser } from "../user-permissions/dto/current-user.js";
import { AccessLogInterceptor } from "./access-log.interceptor.js";
import type { AccessLogConfig } from "./access-log.module.js";

const user: CurrentUser = { id: "user-1", name: "Admin", email: "demo@dextinity.com", permissions: [] };

const mockMcpContext = (options: { input?: unknown; request?: object }) => {
    const args = [options.input, { kind: "tool", name: "get_page", request: options.request }];
    return createMock<ExecutionContext>({
        getType: () => "mcp",
        getArgs: () => args,
        getArgByIndex: <T>(index: number) => args[index] as T,
        switchToHttp: () => {
            throw new Error("An MCP call has no HTTP context");
        },
    });
};

const mockRequest = () => ({ headers: { "x-forwarded-for": "203.0.113.1" }, user });

describe("AccessLogInterceptor", () => {
    let next: CallHandler;

    beforeEach(() => {
        next = { handle: vi.fn().mockReturnValue(of(undefined)) };
    });

    const createInterceptor = (config?: AccessLogConfig) => {
        const interceptor = new AccessLogInterceptor(config);
        const log = vi.spyOn(interceptor["logger"], "log").mockImplementation(() => undefined);
        return { interceptor, log };
    };

    describe("MCP calls", () => {
        it("logs the tool, the user, the IP address and the tool input", () => {
            const { interceptor, log } = createInterceptor();
            interceptor.intercept(mockMcpContext({ input: { id: "page-1" }, request: mockRequest() }), next);

            expect(log).toHaveBeenCalledWith('Request type: mcp | ip: 203.0.113.1 | user: user-1 | tool: get_page | args: {"id":"page-1"}');
            expect(next.handle).toHaveBeenCalled();
        });

        it("doesn't log the input and data arguments", () => {
            const { interceptor, log } = createInterceptor();
            interceptor.intercept(
                mockMcpContext({ input: { id: "page-1", input: { title: "Secret" }, data: { text: "Secret" } }, request: mockRequest() }),
                next,
            );

            expect(log).toHaveBeenCalledWith(expect.stringContaining('args: {"id":"page-1"}'));
            expect(log).not.toHaveBeenCalledWith(expect.stringContaining("Secret"));
        });

        it("doesn't log a call shouldLogRequest ignores", () => {
            const shouldLogRequest = vi.fn().mockReturnValue(false);
            const { interceptor, log } = createInterceptor({ shouldLogRequest });
            const request = mockRequest();
            interceptor.intercept(mockMcpContext({ input: {}, request }), next);

            expect(shouldLogRequest).toHaveBeenCalledWith({ user, req: request });
            expect(log).not.toHaveBeenCalled();
            expect(next.handle).toHaveBeenCalled();
        });

        it("logs a call without an HTTP request", () => {
            const { interceptor, log } = createInterceptor();
            interceptor.intercept(mockMcpContext({ input: { id: "page-1" } }), next);

            expect(log).toHaveBeenCalledWith('Request type: mcp | tool: get_page | args: {"id":"page-1"}');
        });
    });
});
