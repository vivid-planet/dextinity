import { createMock } from "@golevelup/ts-vitest";
import type { ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { describe, expect, it } from "vitest";

import { CdnGuard } from "./cdn.guard.js";

const mockMcpContext = (request: Partial<Request> | undefined) => {
    const args = [{}, { kind: "tool", name: "test", transport: request ? "http" : "stdio", request }];
    return createMock<ExecutionContext>({
        getType: () => "mcp",
        getArgByIndex: (index: number) => args[index],
    });
};

const mockRequest = (headers: Record<string, string>): Partial<Request> => ({
    header: ((name: string) => headers[name.toLowerCase()]) as Request["header"],
});

describe("CdnGuard", () => {
    const guard = new CdnGuard({ headerName: "x-cdn-origin-check", headerValue: "secret" });

    it("allows an MCP call with the CDN header", () => {
        const request = mockRequest({ "x-forwarded-for": "1.2.3.4", "x-cdn-origin-check": "secret" });
        expect(guard.canActivate(mockMcpContext(request))).toBe(true);
    });

    it("denies an MCP call without the CDN header", () => {
        const request = mockRequest({ "x-forwarded-for": "1.2.3.4" });
        expect(guard.canActivate(mockMcpContext(request))).toBe(false);
    });

    it("denies an MCP call over stdio", () => {
        expect(guard.canActivate(mockMcpContext(undefined))).toBe(false);
    });
});
