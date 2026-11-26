import { createMock } from "@golevelup/ts-vitest";
import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AffectedEntity } from "../user-permissions/decorators/affected-entity.decorator.js";
import { AffectedScope } from "../user-permissions/decorators/affected-scope.decorator.js";
import type { CurrentUser } from "../user-permissions/dto/current-user.js";
import { AccessLogInterceptor } from "./access-log.interceptor.js";
import type { AccessLogConfig } from "./access-log.module.js";

const user: CurrentUser = { id: "user-1", name: "Admin", email: "demo@dextinity.com", permissions: [] };

class Page {}

class Tools {
    @AffectedEntity(Page, { idArg: "id" })
    getPage() {}

    @AffectedEntity(Page, { pageTreeNodeIdArg: "nodeId" })
    editBlocks() {}

    searchPages() {}

    @AffectedScope((args: { domain: string; language: string }) => ({ domain: args.domain, language: args.language }))
    listPages() {}
}

const mockMcpContext = (options: { handler: keyof Tools; input?: unknown; request?: object }) => {
    const args = [options.input, { kind: "tool", name: options.handler, request: options.request }];
    return createMock<ExecutionContext>({
        getType: () => "mcp",
        getArgs: () => args,
        getArgByIndex: <T>(index: number) => args[index] as T,
        getHandler: () => Tools.prototype[options.handler],
        getClass: () => Tools,
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
        it("logs the tool, the user, the IP address and the ID of the affected entity", () => {
            const { interceptor, log } = createInterceptor();
            interceptor.intercept(mockMcpContext({ handler: "getPage", input: { id: "page-1" }, request: mockRequest() }), next);

            expect(log).toHaveBeenCalledWith('Request type: mcp | ip: 203.0.113.1 | user: user-1 | tool: getPage | args: {"id":"page-1"}');
            expect(next.handle).toHaveBeenCalled();
        });

        it("doesn't log the content of a write tool", () => {
            const { interceptor, log } = createInterceptor();
            interceptor.intercept(
                mockMcpContext({
                    handler: "editBlocks",
                    input: { nodeId: "node-1", operations: [{ type: "update", props: { text: "Secret" } }] },
                    request: mockRequest(),
                }),
                next,
            );

            expect(log).toHaveBeenCalledWith(expect.stringContaining('args: {"nodeId":"node-1"}'));
            expect(log).not.toHaveBeenCalledWith(expect.stringContaining("Secret"));
        });

        it("logs the scope argument but no free text", () => {
            const { interceptor, log } = createInterceptor();
            interceptor.intercept(
                mockMcpContext({
                    handler: "searchPages",
                    input: { scope: { domain: "main", language: "en" }, query: "Secret" },
                    request: mockRequest(),
                }),
                next,
            );

            expect(log).toHaveBeenCalledWith(expect.stringContaining('args: {"scope":{"domain":"main","language":"en"}}'));
            expect(log).not.toHaveBeenCalledWith(expect.stringContaining("Secret"));
        });

        it("logs the scope of @AffectedScope", () => {
            const { interceptor, log } = createInterceptor();
            interceptor.intercept(
                mockMcpContext({ handler: "listPages", input: { domain: "main", language: "en", query: "Secret" }, request: mockRequest() }),
                next,
            );

            expect(log).toHaveBeenCalledWith(expect.stringContaining('args: {"affectedScope":{"domain":"main","language":"en"}}'));
            expect(log).not.toHaveBeenCalledWith(expect.stringContaining("Secret"));
        });

        it("doesn't log a call shouldLogRequest ignores", () => {
            const shouldLogRequest = vi.fn().mockReturnValue(false);
            const { interceptor, log } = createInterceptor({ shouldLogRequest });
            const request = mockRequest();
            interceptor.intercept(mockMcpContext({ handler: "getPage", input: { id: "page-1" }, request }), next);

            expect(shouldLogRequest).toHaveBeenCalledWith({ user, req: request });
            expect(log).not.toHaveBeenCalled();
            expect(next.handle).toHaveBeenCalled();
        });

        it("logs a call without an HTTP request", () => {
            const { interceptor, log } = createInterceptor();
            interceptor.intercept(mockMcpContext({ handler: "getPage", input: { id: "page-1" } }), next);

            expect(log).toHaveBeenCalledWith('Request type: mcp | tool: getPage | args: {"id":"page-1"}');
        });
    });
});
